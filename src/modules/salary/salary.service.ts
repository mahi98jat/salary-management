
import { employeeRepository } from '../employee/employee.repository';

// Tax Deducted at Source (TDS) rates by country
const TDS_RATES: { [key: string]: number } = {
  IN: 0.10, // 10% for India
  US: 0.15, // 15% for USA
  // A default rate for any other country
  DEFAULT: 0.05,
};

// FIX: Define a type for the employee object returned from the repository.
// The repository's findById method returns an `unknown` type, so it must be
// cast to a specific shape before its properties can be accessed.
interface EmployeeForSalaryCalculation {
  salary: number;
  country: string;
}

export class SalaryService {
  /**
   * Calculates the net salary for a given employee after TDS deductions.
   * @param employeeId The UUID of the employee.
   * @returns An object with salary details or null if the employee is not found.
   */
  calculateNetSalary(employeeId: string) {
    const employee = employeeRepository.findById(employeeId);

    if (!employee) {
      return null;
    }

    // FIX: Cast the `employee` object, which is of type `unknown`, to the defined interface.
    // This resolves the error and allows for safe property access.
    const typedEmployee = employee as EmployeeForSalaryCalculation;

    // Ensure types are correct for calculation
    const grossSalary = typedEmployee.salary;
    const country = typedEmployee.country;

    // Determine the tax rate, falling back to a default if the country is not in our list
    const tdsRate = TDS_RATES[country] ?? TDS_RATES.DEFAULT;

    const tds = grossSalary * tdsRate;
    const netSalary = grossSalary - tds;

    return {
      employeeId,
      grossSalary,
      netSalary,
      tds,
      country,
    };
  }
}

export const salaryService = new SalaryService();
