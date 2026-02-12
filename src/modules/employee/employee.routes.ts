
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { employeeService } from './employee.service';
import { 
  createEmployeeSchema, 
  CreateEmployeeInput,
  updateEmployeeSchema,
  UpdateEmployeeInput,
  employeeResponseSchema, 
  getEmployeeParamsSchema, 
  employeesResponseSchema 
} from './employee.schema';

// POST /
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

// GET /:id
async function getEmployeeByIdHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  try {
    const employee = await employeeService.getEmployeeById(id);
    if (!employee) {
      return reply.code(404).send({ message: 'Employee not found' });
    }
    return reply.code(200).send(employee);
  } catch (error) {
    console.error(`Error fetching employee ${id}:`, error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
}

// GET /
async function getAllEmployeesHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const employees = await employeeService.getAllEmployees();
    return reply.code(200).send(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return reply.code(500).send({ message: "Internal Server Error" });
  }
}

// PUT /:id
async function updateEmployeeHandler(
  request: FastifyRequest<{ Params: { id: string }, Body: UpdateEmployeeInput }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  try {
    const employee = await employeeService.updateEmployee(id, request.body);

    if (!employee) {
      return reply.code(404).send({ message: 'Employee not found' });
    }

    return reply.code(200).send(employee);
  } catch (error) {
    console.error(`Error updating employee ${id}:`, error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
}

// DELETE /:id
async function deleteEmployeeHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  try {
    const success = await employeeService.deleteEmployee(id);

    if (!success) {
      return reply.code(404).send({ message: 'Employee not found' });
    }

    // On successful deletion, return 204 No Content
    return reply.code(204).send();
  } catch (error) {
    console.error(`Error deleting employee ${id}:`, error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
}

export async function employeeRoutes(app: FastifyInstance) {
  // Create
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

  // Get by ID
  app.get(
    '/:id',
    {
      schema: {
        params: getEmployeeParamsSchema,
        response: {
          200: employeeResponseSchema,
        },
      },
    },
    getEmployeeByIdHandler
  );

  // Get All
  app.get(
    '/',
    {
      schema: {
        response: {
          200: employeesResponseSchema
        }
      }
    },
    getAllEmployeesHandler
  );

  // Update
  app.put(
    '/:id',
    {
      schema: {
        params: getEmployeeParamsSchema,
        body: updateEmployeeSchema,
        response: {
          200: employeeResponseSchema,
        },
      },
    },
    updateEmployeeHandler
  );

  // Delete
  app.delete(
    '/:id',
    {
      schema: {
        params: getEmployeeParamsSchema,
        response: {
          204: {
            type: 'null',
            description: 'Employee deleted successfully'
          }
        },
      },
    },
    deleteEmployeeHandler
  );
}