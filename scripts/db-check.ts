import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Checking database connectivity...");
  try {
    // Attempt a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ Database connection successful! User count: ${userCount}`);
  } catch (error: any) {
    console.error("❌ Database connectivity check failed:");
    console.error(error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
