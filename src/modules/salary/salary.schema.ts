
import { z } from 'zod';

export const salaryCalculationResponseSchema = z.object({
  employeeId: z.string().uuid(),
  grossSalary: z.number(),
  netSalary: z.number(),
  tds: z.number(),
  country: z.string(),
});
