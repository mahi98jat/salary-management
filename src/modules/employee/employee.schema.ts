
import { z } from 'zod';

// Schema for request params (e.g., /employees/:id)
export const getEmployeeParamsSchema = z.object({
  id: z.string().uuid("Invalid employee ID format"),
});

export const createEmployeeSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters long"),
  jobTitle: z.string().min(2, "Job title must be at least 2 characters long"),
  country: z.string().length(2, "Country must be a 2-character ISO code"),
  salary: z.number().positive("Salary must be a positive number"),
});

// For updates, all fields are optional
export const updateEmployeeSchema = createEmployeeSchema.partial();

export const employeeResponseSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  jobTitle: z.string(),
  country: z.string(),
  salary: z.number(),
});

// Schema for a list of employees
export const employeesResponseSchema = z.array(employeeResponseSchema);

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;