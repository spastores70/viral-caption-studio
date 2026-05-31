import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  const adminPassword = await bcrypt.hash("admin123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@viralcaption.studio" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@viralcaption.studio",
      password: adminPassword,
      role: "ADMIN",
      subscription: {
        create: {
          plan: "CREATOR_PRO",
          status: "ACTIVE",
        },
      },
    },
  });

  // Demo pro user
  const proPassword = await bcrypt.hash("demo123456", 12);
  const proUser = await prisma.user.upsert({
    where: { email: "pro@demo.com" },
    update: {},
    create: {
      name: "Pro Demo User",
      email: "pro@demo.com",
      password: proPassword,
      role: "PRO",
      subscription: {
        create: {
          plan: "PRO",
          status: "ACTIVE",
        },
      },
    },
  });

  // Demo free user
  const freePassword = await bcrypt.hash("demo123456", 12);
  const freeUser = await prisma.user.upsert({
    where: { email: "free@demo.com" },
    update: {},
    create: {
      name: "Free Demo User",
      email: "free@demo.com",
      password: freePassword,
      role: "FREE",
      subscription: {
        create: {
          plan: "FREE",
          status: "ACTIVE",
        },
      },
    },
  });

  // Sample templates
  const templates = [
    {
      name: "Facebook Reel Caption Generator",
      description: "Viral reel captions with hooks that stop the scroll",
      platform: "FACEBOOK" as const,
      contentType: "REEL_CAPTION" as const,
      tone: "VIRAL" as const,
      length: "MEDIUM" as const,
      topic: "My latest video reel",
      audience: "Facebook users",
    },
    {
      name: "Funny Couple Caption",
      description: "Hilarious husband and wife moments",
      platform: "FACEBOOK" as const,
      contentType: "FUNNY_COUPLE_CAPTION" as const,
      tone: "FUNNY" as const,
      length: "SHORT" as const,
      topic: "Funny married life moments",
      audience: "Married couples and parents",
    },
    {
      name: "OFW Appreciation Post",
      description: "Heartfelt content for OFW workers",
      platform: "FACEBOOK" as const,
      contentType: "OFW_CONTENT" as const,
      tone: "EMOTIONAL" as const,
      length: "MEDIUM" as const,
      topic: "Life as an OFW and missing home",
      audience: "OFW workers and their families",
    },
  ];

  for (const template of templates) {
    await prisma.template.upsert({
      where: { id: template.name.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: {
        id: template.name.toLowerCase().replace(/\s+/g, "-"),
        ...template,
        isPublic: true,
      },
    });
  }

  console.log("✅ Seed completed!");
  console.log("\nTest accounts:");
  console.log("  Admin: admin@viralcaption.studio / admin123456");
  console.log("  Pro: pro@demo.com / demo123456");
  console.log("  Free: free@demo.com / demo123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
