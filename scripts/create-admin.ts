import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error("Usage: npm run create-admin -- <email> <name>");
    process.exit(1);
  }

  const email = args[0].toLowerCase().trim();
  const name = args.slice(1).join(" ");

  console.log(`Creating/updating admin user: ${email} (${name})...`);

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name,
        email,
        role: "ADMIN",
        active: true,
      },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        role: "ADMIN",
        active: true,
      },
    });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  await prisma.userInvite.updateMany({
    where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() } },
    data: { usedAt: new Date() },
  });

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 48);

  await prisma.userInvite.create({
    data: {
      userId: user.id,
      tokenHash,
      type: "INVITE",
      expiresAt,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const setupUrl = `${appUrl}/set-password?token=${token}`;

  console.log("--------------------------------------------------");
  console.log("✅ Admin user created/updated successfully.");
  console.log("Please copy the following link to set your password:");
  console.log("");
  console.log(setupUrl);
  console.log("");
  console.log("This link will expire in 48 hours and can only be used once.");
  console.log("--------------------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
