
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { salaryService } from './salary.service';
import { getEmployeeParamsSchema } from '../employee/employee.schema';
import { salaryCalculationResponseSchema, salaryMetricsResponseSchema } from './salary.schema';

async function calculateSalaryHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  try {
    const result = salaryService.calculateNetSalary(id);

    if (!result) {
      return reply.code(404).send({ message: 'Employee not found' });
    }

    return reply.code(200).send(result);
  } catch (error) {
    console.error(`Error calculating salary for employee ${id}:`, error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
}

async function getMetricsByCountryHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
      const metrics = await salaryService.getSalaryMetricsByCountry();
      return reply.code(200).send(metrics);
  } catch (error) {
      console.error(`Error fetching salary metrics by country:`, error);
      return reply.code(500).send({ message: "Internal Server Error" });
  }
}

async function getMetricsByJobTitleHandler(request: FastifyRequest, reply: FastifyReply) {
  try {
      const metrics = await salaryService.getSalaryMetricsByJobTitle();
      return reply.code(200).send(metrics);
  } catch (error) {
      console.error(`Error fetching salary metrics by job title:`, error);
      return reply.code(500).send({ message: "Internal Server Error" });
  }
}

export async function salaryRoutes(app: FastifyInstance) {
  app.get(
    '/calculate/:id',
    {
      schema: {
        params: getEmployeeParamsSchema,
        response: {
          200: salaryCalculationResponseSchema,
        },
      },
    },
    calculateSalaryHandler
  );

  app.get(
    '/metrics/by-country',
    {
      schema: {
        response: {
          200: salaryMetricsResponseSchema,
        }
      }
    },
    getMetricsByCountryHandler
  );

  app.get(
    '/metrics/by-job-title',
    {
      schema: {
        response: {
          200: salaryMetricsResponseSchema,
        }
      }
    },
    getMetricsByJobTitleHandler
  );
}
