import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();
const DEFAULT_PASSWORD = "ChangeMe123!";

const users = [
  { name: "Admin User", email: "admin@kgwiki.local", role: Role.admin, bio: "KGwiki demo administrator" },
  { name: "Alice Teacher", email: "alice@kgwiki.local", role: Role.user, bio: "Early years classroom teacher" },
  { name: "Bob Educator", email: "bob@kgwiki.local", role: Role.user, bio: "Outdoor learning enthusiast" },
  { name: "Carol Parent", email: "carol@kgwiki.local", role: Role.user, bio: "Home activity contributor" }
];

const activityTemplates = [
  ["Morning Circle Feelings Check", "conversation"], ["Counting With Button Jars", "math"], ["Leaf Print Painting", "art"],
  ["Rhythm and Freeze Dance", "music"], ["Story Basket Retell", "reading"], ["Animal Walk Relay", "movement"],
  ["Cloud Watch and Describe", "observation"], ["Alphabet Scavenger Hunt", "game"], ["Friendship Role Play", "social interaction"],
  ["Shape Hunt in Classroom", "math"], ["Simple Percussion Parade", "music"], ["Color Mixing Exploration", "art"],
  ["Picture Talk: Farm Day", "conversation"], ["Obstacle Path Balance", "movement"], ["Read-Aloud With Props", "reading"],
  ["Puddle Science Talk", "observation"], ["Video Lesson: Seasons Intro", "video lesson"], ["Sorting by Size Game", "game"],
  ["Music and Emotion Match", "music"], ["Community Helpers Chat", "conversation"], ["Number Hopscotch", "math"],
  ["Nature Collage", "art"], ["Listening Walk", "observation"], ["Cooperative Ball Pass", "social interaction"]
] as const;

const ageGroups = ["2–3", "3–4", "4–5", "5–6", "6–7", "7–8"] as const;
const seasons = ["winter", "spring", "summer", "autumn", "all seasons"] as const;
const locations = ["classroom", "outdoor", "gym", "music room", "individual", "small group"] as const;
const complexity = ["easy", "medium", "advanced"] as const;

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);
  const createdUsers: Record<string, string> = {};

  for (const user of users) {
    const upserted = await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role, bio: user.bio, passwordHash },
      create: { ...user, passwordHash }
    });
    createdUsers[user.email] = upserted.id;
  }

  const authors = [createdUsers["alice@kgwiki.local"], createdUsers["bob@kgwiki.local"], createdUsers["carol@kgwiki.local"]];
  const activityIds: string[] = [];
  for (let index = 0; index < activityTemplates.length; index += 1) {
    const [title, category] = activityTemplates[index];
    const id = `cm-demo-activity-${String(index + 1).padStart(3, "0")}`;
    activityIds.push(id);
    await prisma.activity.upsert({
      where: { id },
      update: {},
      create: {
        id,
        title,
        summary: `${title} for preschool classroom practice.`,
        ageGroup: ageGroups[index % ageGroups.length],
        durationMinutes: 15 + (index % 4) * 10,
        goal: "Support social, language, and cognitive development.",
        objectives: ["Stay engaged for the activity duration", "Practice target skill with peers"],
        description: "Facilitator introduces the task, models expected behavior, and supports children through guided practice.",
        steps: ["Warm-up", "Main activity", "Reflection and tidy-up"],
        materialsNeeded: ["Printed cards", "Markers", "Simple props"],
        category,
        tags: ["preschool", category.replace(" ", "-"), "mvp"],
        season: seasons[index % seasons.length],
        holidayLinks: [],
        locationType: locations[index % locations.length],
        complexityLevel: complexity[index % complexity.length],
        authorId: authors[index % authors.length],
        isPublic: true
      }
    });
  }

  await prisma.comment.deleteMany({ where: { activityId: { in: activityIds } } });
  await prisma.rating.deleteMany({ where: { activityId: { in: activityIds } } });

  for (let index = 0; index < 12; index += 1) {
    const activityId = activityIds[index];
    const authorId = authors[(index + 1) % authors.length];
    await prisma.comment.create({
      data: { activityId, authorId, content: "Great classroom flow. Children stayed engaged and transitions were smooth." }
    });
    await prisma.rating.upsert({
      where: { activityId_authorId: { activityId, authorId } },
      update: { value: (index % 5) + 1 },
      create: { activityId, authorId, value: (index % 5) + 1 }
    });
  }

  const dayPlan = await prisma.plan.upsert({
    where: { id: "cm-demo-plan-day-001" },
    update: { title: "Monday Language + Movement", type: "day", authorId: createdUsers["alice@kgwiki.local"], date: new Date("2026-04-20") },
    create: { id: "cm-demo-plan-day-001", title: "Monday Language + Movement", type: "day", authorId: createdUsers["alice@kgwiki.local"], date: new Date("2026-04-20") }
  });
  await prisma.planItem.deleteMany({ where: { planId: dayPlan.id } });
  await prisma.planItem.createMany({
    data: activityIds.slice(0, 4).map((activityId, orderIndex) => ({ planId: dayPlan.id, activityId, orderIndex, notes: "Seeded day plan item" }))
  });

  const weekPlan = await prisma.plan.upsert({
    where: { id: "cm-demo-plan-week-001" },
    update: { title: "Week 17 Thematic Plan", type: "week", authorId: createdUsers["bob@kgwiki.local"], weekStartDate: new Date("2026-04-20") },
    create: { id: "cm-demo-plan-week-001", title: "Week 17 Thematic Plan", type: "week", authorId: createdUsers["bob@kgwiki.local"], weekStartDate: new Date("2026-04-20") }
  });
  await prisma.planItem.deleteMany({ where: { planId: weekPlan.id } });
  await prisma.planItem.createMany({
    data: activityIds.slice(4, 11).map((activityId, orderIndex) => ({ planId: weekPlan.id, activityId, orderIndex, notes: `Day ${orderIndex + 1} focus` }))
  });

  console.log("Seed completed with realistic activities, comments, ratings, and plans.");
  console.log(`Default password for demo users: ${DEFAULT_PASSWORD}`);
}

main().finally(async () => prisma.$disconnect());
