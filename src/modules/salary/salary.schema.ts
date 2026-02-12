
import { z } from 'zod';

export const salaryCalculationResponseSchema = z.object({
  employeeId: z.string().uuid(),
  grossSalary: z.number(),
  netSalary: z.number(),
  tds: z.number(),
  country: z.string(),
});

const salaryMetricSchema = z.object({
  min: z.number(),
  max: z.number(),
  average: z.number(),
});

export const salaryMetricsResponseSchema = z.record(z.string(), salaryMetricSchema);
