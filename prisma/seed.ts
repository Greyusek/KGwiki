import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();
const DEFAULT_PASSWORD = "ChangeMe123!";

const demoUsers: Array<{ name: string; email: string; role: Role }> = [
  { name: "Admin User", email: "admin@kgwiki.local", role: Role.admin },
  { name: "Alice Teacher", email: "alice@kgwiki.local", role: Role.user },
  { name: "Bob Educator", email: "bob@kgwiki.local", role: Role.user },
  { name: "Carol Parent", email: "carol@kgwiki.local", role: Role.user }
];

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  for (const user of demoUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        passwordHash
      },
      create: {
        name: user.name,
        email: user.email,
        role: user.role,
        passwordHash
      }
    });
  }

  console.log("Seeded demo users.");
  console.log(`Default password for demo users: ${DEFAULT_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
