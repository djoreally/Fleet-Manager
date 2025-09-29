import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

// Initialize Prisma Client with Accelerate
// This single instance will be imported by all serverless functions
export const prisma = new PrismaClient().$extends(withAccelerate())