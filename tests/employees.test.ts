
import { test, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';

let app: FastifyInstance;

beforeAll(async () => {
  // Build the app instance before all tests
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  // Close the server instance after all tests
  await app.close();
});

test('[GREEN] POST /employees should create a new employee', async () => {
  const payload = {
    fullName: 'John Doe',
    jobTitle: 'Software Engineer',
    country: 'USA',
    salary: 120000,
  };

  const response = await app.inject({
    method: 'POST',
    url: '/employees',
    payload,
  });

  // This test should now pass
  expect(response.statusCode).toBe(201);

  const body = JSON.parse(response.body);
  expect(body.id).toBeDefined();
  expect(body.fullName).toBe(payload.fullName);
  expect(body.salary).toBe(payload.salary);
});

// New failing test for validation
test.each([
  {
    payload: { jobTitle: 'QA Tester', country: 'UK', salary: 60000 },
    case: 'missing fullName',
  },
  {
    payload: { fullName: 'Invalid Salary', jobTitle: 'Manager', country: 'USA', salary: 'not-a-number' },
    case: 'salary is not a number',
  },
  {
    payload: { fullName: 'Short Name', jobTitle: 'S', country: 'USA', salary: 100000 },
    case: 'jobTitle is too short',
  },
  {
    payload: { fullName: 'Negative Salary', jobTitle: 'Analyst', country: 'CA', salary: -50000 },
    case: 'salary is a negative number',
  },
])('[RED] POST /employees should return 400 on invalid payload ($case)', async ({ payload }) => {
  const response = await app.inject({
    method: 'POST',
    url: '/employees',
    payload,
  });

  expect(response.statusCode).toBe(400);
  const body = JSON.parse(response.body);
  expect(body.error).toBe('Bad Request');
  expect(body.message).toBeDefined();
});
