import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();
const DEFAULT_PASSWORD = "ChangeMe123!";

const demoUsers: Array<{ name: string; email: string; role: Role; bio: string }> = [
  { name: "Admin User", email: "admin@kgwiki.local", role: Role.admin, bio: "KGwiki demo administrator" },
  { name: "Alice Teacher", email: "alice@kgwiki.local", role: Role.user, bio: "Early years classroom teacher" },
  { name: "Bob Educator", email: "bob@kgwiki.local", role: Role.user, bio: "Outdoor learning enthusiast" },
  { name: "Carol Parent", email: "carol@kgwiki.local", role: Role.user, bio: "Home activity contributor" }
];

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  const createdUsers = [] as Array<{ id: string; email: string; role: Role }>;

  for (const user of demoUsers) {
    const upserted = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        bio: user.bio,
        passwordHash
      },
      create: {
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        passwordHash
      }
    });
    createdUsers.push({ id: upserted.id, email: upserted.email, role: upserted.role });
  }

  const alice = createdUsers.find((user) => user.email === "alice@kgwiki.local");
  const bob = createdUsers.find((user) => user.email === "bob@kgwiki.local");

  if (alice && bob) {
    const activity = await prisma.activity.upsert({
      where: { id: "cm-demo-activity-001" },
      update: {
        title: "Nature Texture Hunt",
        summary: "Children find and discuss textures outdoors.",
        ageGroup: "4-6",
        durationMinutes: 30,
        goal: "Language + sensory awareness",
        objectives: ["Observe nature", "Describe textures"],
        description: "Walk around and collect safe natural materials for texture discussion.",
        steps: ["Introduce texture words", "Collect samples", "Group sharing"],
        materialsNeeded: ["Collection tray", "Paper"],
        category: "Outdoor Learning",
        tags: ["nature", "language"],
        holidayLinks: [],
        locationType: "outdoor",
        complexityLevel: "easy",
        authorId: alice.id,
        isPublic: true
      },
      create: {
        id: "cm-demo-activity-001",
        title: "Nature Texture Hunt",
        summary: "Children find and discuss textures outdoors.",
        ageGroup: "4-6",
        durationMinutes: 30,
        goal: "Language + sensory awareness",
        objectives: ["Observe nature", "Describe textures"],
        description: "Walk around and collect safe natural materials for texture discussion.",
        steps: ["Introduce texture words", "Collect samples", "Group sharing"],
        materialsNeeded: ["Collection tray", "Paper"],
        category: "Outdoor Learning",
        tags: ["nature", "language"],
        holidayLinks: [],
        locationType: "outdoor",
        complexityLevel: "easy",
        authorId: alice.id,
        isPublic: true
      }
    });

    await prisma.comment.create({
      data: {
        activityId: activity.id,
        authorId: bob.id,
        content: "Worked really well with mixed age groups."
      }
    });

    const plan = await prisma.plan.upsert({
      where: { id: "cm-demo-plan-001" },
      update: {
        title: "Monday Learning Plan",
        type: "day",
        authorId: alice.id,
        date: new Date("2026-04-20")
      },
      create: {
        id: "cm-demo-plan-001",
        title: "Monday Learning Plan",
        type: "day",
        authorId: alice.id,
        date: new Date("2026-04-20")
      }
    });

    await prisma.planItem.deleteMany({ where: { planId: plan.id } });
    await prisma.planItem.create({
      data: {
        planId: plan.id,
        activityId: activity.id,
        orderIndex: 0,
        notes: "Bring extra material trays"
      }
    });
  }

  console.log("Seeded demo users and baseline content.");
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
