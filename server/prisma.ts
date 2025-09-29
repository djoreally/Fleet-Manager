import { PrismaClient } from '@prisma/client';

// Instantiate a single Prisma Client and export it for use throughout the server.
const prisma = new PrismaClient();

export default prisma;