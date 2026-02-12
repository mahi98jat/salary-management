
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { employeeService } from './employee.service';
import { createEmployeeSchema, CreateEmployeeInput, employeeResponseSchema } from './employee.schema';

async function createEmployeeHandler(
  request: FastifyRequest<{ Body: CreateEmployeeInput }>,
  reply: FastifyReply
) {
  try {
    const employee = await employeeService.createEmployee(request.body);
    return reply.code(201).send(employee);
  } catch (error) {
    // Basic error handling
    console.error("Error creating employee:", error);
    return reply.code(500).send({ message: "Internal Server Error" });
  }
}


export async function employeeRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      schema: {
        body: createEmployeeSchema,
        response: {
          201: employeeResponseSchema,
        },
      },
    },
    createEmployeeHandler
  );
}
