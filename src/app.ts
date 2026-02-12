
import fastify from 'fastify';
import { employeeRoutes } from './modules/employee/employee.routes';

export async function buildApp() {
  const app = fastify({
    logger: true,
  });

  // Register routes
  app.register(employeeRoutes, { prefix: '/employees' });

  return app;
}
