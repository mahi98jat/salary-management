
import { employeeRepository } from './employee.repository';
import type { CreateEmployeeInput } from './employee.schema';

export class EmployeeService {
  async createEmployee(data: CreateEmployeeInput) {
    // In a real app, more complex business logic would go here (e.g., checks, transformations)
    const employee = employeeRepository.create(data);
    return employee;
  }
}

export const employeeService = new EmployeeService();
