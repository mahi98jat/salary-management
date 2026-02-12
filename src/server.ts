import { buildApp } from './app';
import { initDb } from './database';

async function start() {
  try {
    // Initialize DB
    initDb();

    // Build Fastify app
    const app = await buildApp();

    // Start server
    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log(`Server listening at http://localhost:3000`);
  } catch (err) {
    console.error(err);
    // FIX: The `process` object is a global in Node.js and does not need to be imported.
    process.exit(1);
  }
}

start();