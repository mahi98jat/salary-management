
import { db } from '../../database';
import type { CreateEmployeeInput, UpdateEmployeeInput } from './employee.schema';
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

  findById(id: string) {
    const stmt = db.prepare('SELECT * FROM employees WHERE id = ?');
    // The `get` method returns the row or undefined if not found.
    const employee = stmt.get(id);
    return employee;
  }

  findAll() {
    const stmt = db.prepare('SELECT * FROM employees');
    return stmt.all();
  }

  update(id: string, data: UpdateEmployeeInput) {
    // 1. Verify the employee exists
    const existingEmployee = this.findById(id);
    if (!existingEmployee) {
      return undefined;
    }

    // 2. Dynamically build the SET clause for the SQL query
    const fields = Object.keys(data);
    if (fields.length === 0) {
      // Nothing to update, just return the current state
      return existingEmployee;
    }
    const setClause = fields.map(field => `${field} = @${field}`).join(', ');

    // 3. Prepare and run the update statement
    const stmt = db.prepare(
      `UPDATE employees SET ${setClause} WHERE id = @id`
    );
    stmt.run({ ...data, id });

    // 4. Return the updated employee record
    return this.findById(id);
  }

  delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM employees WHERE id = ?');
    const result = stmt.run(id);

    // The `changes` property will be 1 if a row was deleted, 0 otherwise.
    return result.changes > 0;
  }

  getMetricsByCountry() {
    const stmt = db.prepare(`
      SELECT 
        country,
        MIN(salary) as min, 
        MAX(salary) as max, 
        AVG(salary) as average 
      FROM employees 
      GROUP BY country
    `);
    return stmt.all();
  }

  getMetricsByJobTitle() {
    const stmt = db.prepare(`
      SELECT 
        jobTitle,
        MIN(salary) as min, 
        MAX(salary) as max, 
        AVG(salary) as average 
      FROM employees 
      GROUP BY jobTitle
    `);
    return stmt.all();
  }
}

export const employeeRepository = new EmployeeRepository();