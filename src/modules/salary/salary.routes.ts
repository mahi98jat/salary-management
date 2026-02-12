
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { salaryService } from './salary.service';
import { getEmployeeParamsSchema } from '../employee/employee.schema';
import { salaryCalculationResponseSchema } from './salary.schema';

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
}
