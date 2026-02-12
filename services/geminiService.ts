
import { GoogleGenAI, Type } from "@google/genai";
import { Feature, TDDStep, KataStepContent } from "../types";

/**
 * Executes a function with exponential backoff retry logic.
 * Essential for handling transient network/proxy errors (Code 500/6).
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 1500): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      console.warn(`Gemini API attempt ${i + 1}/${maxRetries} failed. Retrying...`, error);
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

export async function generateKataStep(
  feature: Feature,
  step: TDDStep,
  previousContext?: string
): Promise<KataStepContent> {
  const kataRules = `
    KATA REQUIREMENTS:
    1. Stack: TypeScript, Fastify, Better-SQLite3, Vitest.
    2. Employee Resource: must have fullName, jobTitle, country, salary.
    3. Persistence: Must use SQLite.
    4. Deduction Rules (Salary Calculation):
       - India: TDS is 10% of gross.
       - USA: TDS is 12% of gross.
       - Others: No deductions (net = gross).
    5. Metrics:
       - By Country: Min, Max, Average salary.
       - By Job Title: Average salary.
  `;

  const prompt = `
    You are a world-class Software Craftsperson guiding a student through the "Incubyte Salary Management Kata".
    ${kataRules}

    Target Feature: ${feature}
    Current TDD Phase: ${step}
    Previous Context/Code: ${previousContext || 'Starting this feature.'}

    YOUR TASK:
    - If ${TDDStep.RED}: Provide a failing Vitest test using app.inject() and a failing curl command.
    - If ${TDDStep.GREEN}: Provide the MINIMAL implementation code (Route + Repository) to make the test pass.
    - If ${TDDStep.REFACTOR}: Refactor for SOLID principles (Clean Code, Repository Pattern) and provide a professional git commit message.

    Return the response in strict JSON format.
  `;

  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 4000 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            step: { type: Type.STRING },
            description: { type: Type.STRING },
            testCode: { type: Type.STRING },
            implementationCode: { type: Type.STRING },
            curlCommand: { type: Type.STRING },
            commitMessage: { type: Type.STRING }
          },
          required: ["step", "description", "testCode", "curlCommand"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini API");
    return JSON.parse(text.trim()) as KataStepContent;
  });
}

export async function explainTDDConcept(concept: string, feature: Feature): Promise<string> {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: `As a mentor for the Incubyte Kata, explain why we are in the ${concept} phase for the ${feature} feature. Keep it professional, concise, and focused on the TDD cycle.` }] }],
      config: {
        thinkingConfig: { thinkingBudget: 1000 }
      }
    });
    return response.text || "Focus on the smallest change possible to move the needle.";
  });
}
