
import fastify from 'fastify';
import { employeeRoutes } from './modules/employee/employee.routes';
import { salaryRoutes } from './modules/salary/salary.routes';

export async function buildApp() {
  const app = fastify({
    logger: true,
  });

  // Register routes
  app.register(employeeRoutes, { prefix: '/employees' });
  app.register(salaryRoutes, { prefix: '/salary' });

  return app;
}