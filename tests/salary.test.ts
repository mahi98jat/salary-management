
import { test, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';
import { randomUUID } from 'crypto';

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

test('[GREEN] GET /salary/calculate/:id should calculate net salary for an employee in India', async () => {
  // 1. Create employee
  const payload = { fullName: 'Ravi Kumar', jobTitle: 'Developer', country: 'IN', salary: 100000 };
  const createResponse = await app.inject({ method: 'POST', url: '/employees', payload });
  const employeeId = JSON.parse(createResponse.body).id;

  // 2. Calculate salary
  const response = await app.inject({
    method: 'GET',
    url: `/salary/calculate/${employeeId}`,
  });

  // 3. Assert
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.employeeId).toBe(employeeId);
  expect(body.grossSalary).toBe(100000);
  expect(body.netSalary).toBe(90000); // 10% TDS
  expect(body.tds).toBe(10000);
});

test('[GREEN] GET /salary/calculate/:id should calculate net salary for an employee in the US', async () => {
    // 1. Create employee
    const payload = { fullName: 'John Smith', jobTitle: 'Manager', country: 'US', salary: 120000 };
    const createResponse = await app.inject({ method: 'POST', url: '/employees', payload });
    const employeeId = JSON.parse(createResponse.body).id;
  
    // 2. Calculate salary
    const response = await app.inject({
      method: 'GET',
      url: `/salary/calculate/${employeeId}`,
    });
  
    // 3. Assert
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.grossSalary).toBe(120000);
    expect(body.netSalary).toBe(102000); // 15% TDS
    expect(body.tds).toBe(18000);
});

test('[GREEN] GET /salary/calculate/:id should use default TDS for an unlisted country (DE)', async () => {
  // 1. Create employee from a country not in our explicit TDS list
  const payload = { fullName: 'Hans Zimmer', jobTitle: 'Composer', country: 'DE', salary: 100000 };
  const createResponse = await app.inject({ method: 'POST', url: '/employees', payload });
  const employeeId = JSON.parse(createResponse.body).id;

  // 2. Calculate salary
  const response = await app.inject({
    method: 'GET',
    url: `/salary/calculate/${employeeId}`,
  });

  // 3. Assert
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.grossSalary).toBe(100000);
  expect(body.netSalary).toBe(95000); // 5% default TDS
  expect(body.tds).toBe(5000);
});

test('[GREEN] GET /salary/calculate/:id should use default TDS for an unlisted country (FR)', async () => {
  // 1. Create employee from another country not in our explicit TDS list
  const payload = { fullName: 'Amélie Poulain', jobTitle: 'Waitress', country: 'FR', salary: 50000 };
  const createResponse = await app.inject({ method: 'POST', url: '/employees', payload });
  const employeeId = JSON.parse(createResponse.body).id;

  // 2. Calculate salary
  const response = await app.inject({
    method: 'GET',
    url: `/salary/calculate/${employeeId}`,
  });

  // 3. Assert
  expect(response.statusCode).toBe(200);
  const body = JSON.parse(response.body);
  expect(body.grossSalary).toBe(50000);
  expect(body.netSalary).toBe(47500); // 5% default TDS (2500)
  expect(body.tds).toBe(2500);
});
  
test('[GREEN] GET /salary/calculate/:id should return 404 for non-existent employee', async () => {
    const nonExistentId = randomUUID();
    const response = await app.inject({
        method: 'GET',
        url: `/salary/calculate/${nonExistentId}`,
    });
    expect(response.statusCode).toBe(404);
});
