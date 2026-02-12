
import { z } from 'zod';

export const createEmployeeSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters long"),
  jobTitle: z.string().min(2, "Job title must be at least 2 characters long"),
  country: z.string().min(2, "Country must be at least 2 characters long"),
  salary: z.number().positive("Salary must be a positive number"),
});

export const employeeResponseSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  jobTitle: z.string(),
  country: z.string(),
  salary: z.number(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
