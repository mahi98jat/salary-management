
import { test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app';
import { randomUUID } from 'crypto';
import { db } from '../src/database';

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
});

beforeEach(() => {
  db.exec('DELETE FROM employees');
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

// --- GET /salary/metrics ---

test('[GREEN] GET /salary/metrics/by-country should return salary metrics grouped by country', async () => {
    // 1. Setup
    await app.inject({ method: 'POST', url: '/employees', payload: { fullName: 'US Dev 1', jobTitle: 'Dev', country: 'US', salary: 100000 } });
    await app.inject({ method: 'POST', url: '/employees', payload: { fullName: 'US Dev 2', jobTitle: 'Dev', country: 'US', salary: 120000 } });
    await app.inject({ method: 'POST', url: '/employees', payload: { fullName: 'IN Dev 1', jobTitle: 'Dev', country: 'IN', salary: 80000 } });
    
    // 2. Action
    const response = await app.inject({ method: 'GET', url: '/salary/metrics/by-country' });

    // 3. Assert
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.US).toEqual({ min: 100000, max: 120000, average: 110000 });
    expect(body.IN).toEqual({ min: 80000, max: 80000, average: 80000 });
});

test('[GREEN] GET /salary/metrics/by-job-title should return salary metrics grouped by job title', async () => {
    // 1. Setup
    await app.inject({ method: 'POST', url: '/employees', payload: { fullName: 'Dev 1', jobTitle: 'Developer', country: 'US', salary: 100000 } });
    await app.inject({ method: 'POST', url: '/employees', payload: { fullName: 'Dev 2', jobTitle: 'Developer', country: 'US', salary: 120000 } });
    await app.inject({ method: 'POST', url: '/employees', payload: { fullName: 'Manager 1', jobTitle: 'Manager', country: 'IN', salary: 150000 } });

    // 2. Action
    const response = await app.inject({ method: 'GET', url: '/salary/metrics/by-job-title' });

    // 3. Assert
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.Developer).toEqual({ min: 100000, max: 120000, average: 110000 });
    expect(body.Manager).toEqual({ min: 150000, max: 150000, average: 150000 });
});

test('[GREEN] GET /salary/metrics/by-country should return empty object if no employees', async () => {
    const response = await app.inject({ method: 'GET', url: '/salary/metrics/by-country' });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({});
});

test('[GREEN] GET /salary/metrics/by-job-title should return empty object if no employees', async () => {
    const response = await app.inject({ method: 'GET', url: '/salary/metrics/by-job-title' });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({});
});
