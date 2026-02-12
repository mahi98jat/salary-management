
import { test, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';
import { randomUUID } from 'crypto';

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
    country: 'US',
    salary: 120000,
  };

  const response = await app.inject({
    method: 'POST',
    url: '/employees',
    payload,
  });

  expect(response.statusCode).toBe(201);

  const body = JSON.parse(response.body);
  expect(body.id).toBeDefined();
  expect(body.fullName).toBe(payload.fullName);
  expect(body.salary).toBe(payload.salary);
});

test.each([
  {
    payload: { jobTitle: 'QA Tester', country: 'UK', salary: 60000 },
    case: 'missing fullName',
  },
  {
    payload: { fullName: 'Invalid Salary', jobTitle: 'Manager', country: 'US', salary: 'not-a-number' },
    case: 'salary is not a number',
  },
  {
    payload: { fullName: 'Short Name', jobTitle: 'S', country: 'US', salary: 100000 },
    case: 'jobTitle is too short',
  },
  {
    payload: { fullName: 'Negative Salary', jobTitle: 'Analyst', country: 'CA', salary: -50000 },
    case: 'salary is a negative number',
  },
  {
    payload: { fullName: 'Long Country', jobTitle: 'Geographer', country: 'USA', salary: 85000 },
    case: 'country is more than 2 characters',
  },
])('[GREEN] POST /employees should return 400 on invalid payload ($case)', async ({ payload }) => {
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

// --- GET /employees/:id ---
test('[GREEN] GET /employees/:id should return a single employee', async () => {
  // 1. Create an employee to have something to fetch
  const payload = {
    fullName: 'Jane Smith',
    jobTitle: 'Product Manager',
    country: 'GB',
    salary: 95000,
  };
  const createResponse = await app.inject({
    method: 'POST',
    url: '/employees',
    payload,
  });
  const createdEmployee = JSON.parse(createResponse.body);
  const employeeId = createdEmployee.id;

  // 2. Fetch the employee by ID
  const response = await app.inject({
    method: 'GET',
    url: `/employees/${employeeId}`,
  });

  // 3. Assert the response
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.id).toBe(employeeId);
  expect(body.fullName).toBe(payload.fullName);
  expect(body.country).toBe(payload.country);
});

test('[GREEN] GET /employees/:id should return 404 for a non-existent employee', async () => {
  const nonExistentId = randomUUID();
  const response = await app.inject({
    method: 'GET',
    url: `/employees/${nonExistentId}`,
  });

  expect(response.statusCode).toBe(404);
});

test('[GREEN] GET /employees/:id should return 400 for an invalid UUID', async () => {
    const invalidId = 'not-a-valid-uuid';
    const response = await app.inject({
        method: 'GET',
        url: `/employees/${invalidId}`,
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.message).toContain("Invalid employee ID format");
});

// --- GET /employees ---
test('[GREEN] GET /employees should return a list of all employees', async () => {
  // Create a couple of employees to ensure the list is not empty
  const payload1 = { fullName: 'Alice Wonderland', jobTitle: 'Lead Engineer', country: 'CA', salary: 150000 };
  const payload2 = { fullName: 'Bob Builder', jobTitle: 'DevOps Specialist', country: 'DE', salary: 110000 };

  // Since tests might run in parallel and the DB is shared, we get the initial count first
  const initialResponse = await app.inject({ method: 'GET', url: '/employees' });
  const initialCount = JSON.parse(initialResponse.body).length;

  const createResponse1 = await app.inject({ method: 'POST', url: '/employees', payload: payload1 });
  const createResponse2 = await app.inject({ method: 'POST', url: '/employees', payload: payload2 });
  
  expect(createResponse1.statusCode).toBe(201);
  expect(createResponse2.statusCode).toBe(201);

  const response = await app.inject({
    method: 'GET',
    url: '/employees',
  });

  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  
  expect(Array.isArray(body)).toBe(true);
  expect(body.length).toBe(initialCount + 2);

  const createdId1 = JSON.parse(createResponse1.body).id;
  const createdId2 = JSON.parse(createResponse2.body).id;

  // Check if our created employees are in the list
  const foundAlice = body.find(emp => emp.id === createdId1);
  const foundBob = body.find(emp => emp.id === createdId2);
  expect(foundAlice.fullName).toBe(payload1.fullName);
  expect(foundBob.fullName).toBe(payload2.fullName);
});

// --- PUT /employees/:id ---
test('[GREEN] PUT /employees/:id should update an existing employee', async () => {
  // 1. Create an employee
  const createPayload = { fullName: 'Update Me', jobTitle: 'Intern', country: 'IN', salary: 40000 };
  const createResponse = await app.inject({
    method: 'POST',
    url: '/employees',
    payload: createPayload,
  });
  const employeeId = JSON.parse(createResponse.body).id;

  // 2. Update the employee
  const updatePayload = {
    fullName: 'Updated Name',
    salary: 50000,
  };
  const response = await app.inject({
    method: 'PUT',
    url: `/employees/${employeeId}`,
    payload: updatePayload,
  });

  // 3. Assert the update response
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.fullName).toBe(updatePayload.fullName);
  expect(body.salary).toBe(updatePayload.salary);
  expect(body.jobTitle).toBe(createPayload.jobTitle); // Should remain unchanged
});

test('[GREEN] PUT /employees/:id should return 404 for a non-existent employee', async () => {
  const nonExistentId = randomUUID();
  const updatePayload = { salary: 100000 };
  
  const response = await app.inject({
    method: 'PUT',
    url: `/employees/${nonExistentId}`,
    payload: updatePayload,
  });

  expect(response.statusCode).toBe(404);
});

test('[GREEN] PUT /employees/:id should return 400 for invalid update payload', async () => {
  // 1. Create an employee
  const createPayload = { fullName: 'Valid Employee', jobTitle: 'Tester', country: 'AU', salary: 60000 };
  const createResponse = await app.inject({
    method: 'POST',
    url: '/employees',
    payload: createPayload,
  });
  const employeeId = JSON.parse(createResponse.body).id;

  // 2. Attempt to update with invalid data
  const invalidPayload = { country: 'Australia' }; // Country code is too long
  const response = await app.inject({
    method: 'PUT',
    url: `/employees/${employeeId}`,
    payload: invalidPayload,
  });

  // 3. Assert bad request
  expect(response.statusCode).toBe(400);
});

// --- DELETE /employees/:id ---
test('[GREEN] DELETE /employees/:id should delete an existing employee', async () => {
  // 1. Create an employee to delete
  const createPayload = { fullName: 'Delete Me', jobTitle: 'Temporary', country: 'XX', salary: 1000 };
  const createResponse = await app.inject({
    method: 'POST',
    url: '/employees',
    payload: createPayload,
  });
  const employeeId = JSON.parse(createResponse.body).id;

  // 2. Delete the employee
  const deleteResponse = await app.inject({
    method: 'DELETE',
    url: `/employees/${employeeId}`,
  });

  // 3. Assert the delete response
  expect(deleteResponse.statusCode).toBe(204);
  expect(deleteResponse.body).toBe('');

  // 4. Verify the employee is actually gone
  const getResponse = await app.inject({
    method: 'GET',
    url: `/employees/${employeeId}`,
  });
  expect(getResponse.statusCode).toBe(404);
});

test('[GREEN] DELETE /employees/:id should return 404 for a non-existent employee', async () => {
  const nonExistentId = randomUUID();
  const response = await app.inject({
    method: 'DELETE',
    url: `/employees/${nonExistentId}`,
  });

  expect(response.statusCode).toBe(404);
});
