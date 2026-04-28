import {
  District,
  ListingCategory,
  ListingSource,
  ListingStatus,
  PrismaClient,
} from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.listing.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.company.deleteMany();

  const defaultCompany = await prisma.company.create({
    data: {
      name: process.env.COMPANY_NAME ?? "Ecom Default Company",
      slug: process.env.COMPANY_SLUG ?? "ecom-default",
    },
  });

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@ecom.local";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin123!";
  const adminName = process.env.ADMIN_NAME ?? "System Admin";

  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      name: adminName,
      passwordHash: hashSync(adminPassword, 12),
      role: "SUPER_ADMIN",
      isActive: true,
      companyId: defaultCompany.id,
    },
  });

  const agentSandro = await prisma.user.create({
    data: {
      email: "sandro@ecom.local",
      name: "სანდრო",
      passwordHash: hashSync("Agent123!", 12),
      role: "USER",
      isActive: true,
      companyId: defaultCompany.id,
    },
  });

  const agentNana = await prisma.user.create({
    data: {
      email: "nana@ecom.local",
      name: "ნანა",
      passwordHash: hashSync("Agent123!", 12),
      role: "USER",
      isActive: true,
      companyId: defaultCompany.id,
    },
  });

  const rentTopic = await prisma.topic.create({
    data: {
      nameKa: "ქირა",
      nameEn: "Rent",
      companyId: defaultCompany.id,
    },
  });

  const saleTopic = await prisma.topic.create({
    data: {
      nameKa: "გაყიდვა",
      nameEn: "Sale",
      companyId: defaultCompany.id,
    },
  });

  await prisma.listing.createMany({
    data: [
      {
        myhomeId: "21014156",
        source: ListingSource.MYHOME,
        district: District.GLDANI,
        status: ListingStatus.FOR_RENT,
        category: ListingCategory.RENT,
        cooperation: 100,
        phone: "599 111 222",
        tenantName: "ხალათა",
        rooms: 3,
        floor: 5,
        apartment: 21,
        areaSqm: 78,
        priceGEL: 1200,
        priceFactor: 1.05,
        address: "გლდანის I მკრ., ქუჩა 5",
        comment: "ახალი რემონტი, ავეჯით",
        companyId: defaultCompany.id,
        topicId: rentTopic.id,
        createdById: adminUser.id,
        listingDate: new Date("2026-05-12T10:00:00.000Z"),
      },
      {
        ssGeId: "SS-2001",
        source: ListingSource.SS_GE,
        district: District.SABURTALO,
        status: ListingStatus.LISTED,
        category: ListingCategory.RENT,
        cooperation: 70,
        phone: "598 987 654",
        rooms: 2,
        floor: 3,
        apartment: 12,
        areaSqm: 56,
        priceGEL: 1500,
        priceFactor: 0.95,
        address: "საბურთალო, მინდელის ქ. 12",
        companyId: defaultCompany.id,
        topicId: rentTopic.id,
        createdById: agentSandro.id,
        listingDate: new Date("2026-05-12T12:30:00.000Z"),
      },
      {
        myhomeId: "21014199",
        source: ListingSource.MYHOME,
        district: District.NAKHALOVAKA,
        status: ListingStatus.RENTED,
        category: ListingCategory.RENT,
        cooperation: 50,
        phone: "577 777 777",
        tenantName: "ბექა",
        rooms: 1,
        floor: 7,
        apartment: 31,
        areaSqm: 42,
        priceGEL: 900,
        priceFactor: 1.2,
        address: "ნახალოვკა, რუხაძის ქ.",
        companyId: defaultCompany.id,
        topicId: rentTopic.id,
        createdById: agentNana.id,
        listingDate: new Date("2026-05-11T16:00:00.000Z"),
      },
      {
        ssGeId: "SS-3550",
        source: ListingSource.SS_GE,
        district: District.GLDANI,
        status: ListingStatus.LISTED,
        category: ListingCategory.SALE,
        cooperation: 100,
        phone: "599 000 111",
        rooms: 4,
        floor: 9,
        apartment: 44,
        areaSqm: 110,
        priceGEL: 200000,
        priceFactor: 1.0,
        address: "გლდანის VIII მკრ. 44",
        companyId: defaultCompany.id,
        topicId: saleTopic.id,
        createdById: adminUser.id,
        listingDate: new Date("2026-05-10T14:10:00.000Z"),
      },
      {
        myhomeId: "22000111",
        source: ListingSource.MYHOME,
        district: District.SABURTALO,
        status: ListingStatus.MEETING_SCHEDULED,
        category: ListingCategory.RENT,
        cooperation: 100,
        phone: "555 555 555",
        rooms: 3,
        floor: 11,
        apartment: 50,
        areaSqm: 84,
        priceGEL: 1800,
        priceFactor: 1.1,
        address: "საბურთალო, ყაზბეგის გამზ. 50",
        comment: "შეხვედრა 14:00-ზე",
        companyId: defaultCompany.id,
        topicId: rentTopic.id,
        createdById: agentSandro.id,
        listingDate: new Date("2026-05-10T09:45:00.000Z"),
      },
    ],
  });

  await prisma.team.create({
    data: {
      name: "გუნდი ალფა",
      companyId: defaultCompany.id,
      members: {
        create: [
          { userId: agentSandro.id },
          { userId: agentNana.id },
        ],
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
