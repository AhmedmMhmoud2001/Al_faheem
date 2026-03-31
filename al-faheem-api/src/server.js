import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

async function start() {
  try {
    await prisma.$connect();
    console.log('Database: connected.');
  } catch (e) {
    console.error('\n[!] Database connection failed — login and other DB routes will return 503 until fixed.');
    console.error('    XAMPP: start MySQL, create database `al_faheem`, then: npm run db:push && npm run db:seed');
    if (env.NODE_ENV === 'development') {
      console.error('    Details:', e.name, e.code || e.errorCode || '', e.message);
    }
  }

  app.listen(env.PORT, () => {
    console.log(`Al Faheem API listening on http://localhost:${env.PORT}`);
  });
}

start();
