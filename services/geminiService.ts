
import { GoogleGenAI, Type } from "@google/genai";
import { Feature, TDDStep, KataStepContent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateKataStep(
  feature: Feature,
  step: TDDStep,
  previousContext?: string
): Promise<KataStepContent> {
  const prompt = `
    You are a world-class Software Craftsperson guiding a student through the "Incubyte Salary Management Kata".
    Stack: TypeScript, Fastify, Better-SQLite3, Vitest.
    Feature: ${feature}
    Target Step: ${step}
    Previous Context/Code: ${previousContext || 'Starting fresh'}

    Rules:
    - RED: Provide Vitest failing test and a curl command that fails.
    - GREEN: Provide minimal TypeScript implementation, Repository Pattern, successful curl, and professional git commit.
    - REFACTOR: Clean up code, SOLID principles, and instructions to push to GitHub.

    Return the response in strict JSON format.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
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

  return JSON.parse(response.text) as KataStepContent;
}

export async function explainTDDConcept(concept: string): Promise<string> {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Explain the concept of "${concept}" in the context of TDD and Software Craftsmanship for a junior developer. Keep it concise, inspiring, and professional.`
    });
    return response.text || "No explanation available.";
}
