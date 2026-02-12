
import { Feature, TDDStep, FeatureDetail } from './types';

export const INITIAL_KATA_DATA: FeatureDetail[] = [
  {
    id: Feature.CRUD,
    steps: [
      {
        step: TDDStep.RED,
        description: "Create a failing test for the Employee POST endpoint. It should expect a 201 status code but currently fails because the route doesn't exist.",
        testCode: `import { test, expect } from 'vitest';\nimport { buildApp } from '../src/app';\n\ntest('POST /employees creates a new employee', async () => {\n  const app = await buildApp();\n  const response = await app.inject({\n    method: 'POST',\n    url: '/employees',\n    payload: {\n      fullName: 'Jane Doe',\n      jobTitle: 'Developer',\n      country: 'India',\n      salary: 50000\n    }\n  });\n\n  expect(response.statusCode).toBe(201);\n  const body = JSON.parse(response.body);\n  expect(body.fullName).toBe('Jane Doe');\n});`,
        curlCommand: "curl -X POST http://localhost:3000/employees -H 'Content-Type: application/json' -d '{\"fullName\":\"Jane Doe\",\"jobTitle\":\"Developer\",\"country\":\"India\",\"salary\":50000}'"
      }
    ]
  },
  {
    id: Feature.TDS,
    steps: []
  },
  {
    id: Feature.METRICS,
    steps: []
  }
];

export const MOCK_EMPLOYEES = [
  { id: '1', fullName: 'Alice Johnson', jobTitle: 'Software Engineer', country: 'India', salary: 1200000 },
  { id: '2', fullName: 'Bob Smith', jobTitle: 'Product Manager', country: 'USA', salary: 150000 },
  { id: '3', fullName: 'Charlie Brown', jobTitle: 'Designer', country: 'UK', salary: 60000 },
  { id: '4', fullName: 'David Lee', jobTitle: 'Software Engineer', country: 'India', salary: 1800000 },
  { id: '5', fullName: 'Eve Wilson', jobTitle: 'QA Engineer', country: 'USA', salary: 90000 },
];
