import { createRequire } from 'module';

// Avoid ESM/CJS interop issues with @prisma/client on some Node versions
const require = createRequire(import.meta.url);
const { PrismaClient } = require('@prisma/client');

export const prisma = new PrismaClient();
