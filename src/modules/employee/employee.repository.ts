
import { db } from '../../database';
import type { CreateEmployeeInput } from './employee.schema';
import { randomUUID } from 'crypto';

export class EmployeeRepository {
  create(data: CreateEmployeeInput) {
    const id = randomUUID();
    const newEmployee = { id, ...data };

    const stmt = db.prepare(
      'INSERT INTO employees (id, fullName, jobTitle, country, salary) VALUES (@id, @fullName, @jobTitle, @country, @salary)'
    );

    stmt.run(newEmployee);

    // better-sqlite3 insert is synchronous, so we can immediately return the object
    return newEmployee;
  }
}

export const employeeRepository = new EmployeeRepository();
