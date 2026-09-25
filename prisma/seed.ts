/**
 * Seed script for demo referrer + sample leads.
 * Run with: bun run db:seed
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  // Demo referrer
  const ref = await db.referrer.upsert({
    where: { code: "K1024" },
    update: { displayName: "معرف نمونه", contact: "09120000000", active: true },
    create: {
      code: "K1024",
      displayName: "معرف نمونه",
      contact: "09120000000",
      active: true,
    },
  });
  console.log("Referrer ready:", ref.code);

  // A few sample leads attributed to K1024 so the referrer dashboard isn't empty
  const samples = [
    {
      trackingCode: "KK-DEMO01",
      fullName: "کاربر نمونه یک",
      mobile: "09121110001",
      city: "تهران",
      requestType: "claim",
      status: "contacted",
      referralCode: "K1024",
    },
    {
      trackingCode: "KK-DEMO02",
      fullName: "کاربر نمونه دو",
      mobile: "09121110002",
      city: "اصفهان",
      requestType: "question",
      status: "new",
      referralCode: "K1024",
    },
    {
      trackingCode: "KK-DEMO03",
      fullName: "کاربر نمونه سه",
      mobile: "09121110003",
      city: "شیراز",
      requestType: "assistance",
      status: "completed",
      referralCode: "K1024",
    },
  ];

  for (const s of samples) {
    await db.lead.upsert({
      where: { trackingCode: s.trackingCode },
      update: {},
      create: s,
    });
  }
  console.log("Sample leads ready:", samples.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
