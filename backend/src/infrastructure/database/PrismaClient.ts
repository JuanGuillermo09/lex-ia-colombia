import { PrismaClient } from '@prisma/client';

/** Singleton del cliente Prisma con configuración de logs según el entorno. */
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
