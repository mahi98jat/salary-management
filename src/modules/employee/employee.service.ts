
import { employeeRepository } from './employee.repository';
import type { CreateEmployeeInput, UpdateEmployeeInput } from './employee.schema';

export class EmployeeService {
  async createEmployee(data: CreateEmployeeInput) {
    // In a real app, more complex business logic would go here (e.g., checks, transformations)
    const employee = employeeRepository.create(data);
    return employee;
  }

  async getEmployeeById(id: string) {
    return employeeRepository.findById(id);
  }

  async getAllEmployees() {
    return employeeRepository.findAll();
  }

  async updateEmployee(id: string, data: UpdateEmployeeInput) {
    return employeeRepository.update(id, data);
  }

  async deleteEmployee(id: string): Promise<boolean> {
    return employeeRepository.delete(id);
  }
}

export const employeeService = new EmployeeService();