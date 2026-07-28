import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

// Prisma v7 requires a driver adapter for direct database connections.
// We use the official @prisma/adapter-pg for PostgreSQL (Neon).

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set.');
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

// Singleton pattern — prevents "too many connections" in dev from hot-reload
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}
