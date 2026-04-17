import {
  District,
  ListingSource,
  ListingStatus,
  PrismaClient,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.listing.deleteMany();
  await prisma.topic.deleteMany();

  const rentTopic = await prisma.topic.create({
    data: {
      nameKa: "ქირა",
      nameEn: "Rent",
    },
  });

  const saleTopic = await prisma.topic.create({
    data: {
      nameKa: "გაყიდვა",
      nameEn: "Sale",
    },
  });

  await prisma.listing.createMany({
    data: [
      {
        myhomeId: "21014156",
        source: ListingSource.MYHOME,
        district: District.GLDANI,
        status: ListingStatus.FOR_RENT,
        cooperation: 100,
        phone: "599 111 222",
        tenantName: "ხალათა",
        rooms: 3,
        floor: 5,
        apartment: 21,
        priceGEL: 1200,
        priceFactor: 1.05,
        address: "Gldani 1st block",
        topicId: rentTopic.id,
        listingDate: new Date("2026-05-12T10:00:00.000Z"),
      },
      {
        ssGeId: "SS-2001",
        source: ListingSource.SS_GE,
        district: District.SABURTALO,
        status: ListingStatus.LISTED,
        cooperation: 70,
        phone: "598 987 654",
        rooms: 2,
        floor: 3,
        apartment: 12,
        priceGEL: 1500,
        priceFactor: 0.95,
        address: "Saburtalo, Mindeli street",
        topicId: rentTopic.id,
        listingDate: new Date("2026-05-12T12:30:00.000Z"),
      },
      {
        myhomeId: "21014199",
        source: ListingSource.MYHOME,
        district: District.NAKHALOVAKA,
        status: ListingStatus.RENTED,
        cooperation: 50,
        phone: "577 777 777",
        tenantName: "ბექა",
        rooms: 1,
        floor: 7,
        apartment: 31,
        priceGEL: 900,
        priceFactor: 1.2,
        address: "Nakhalovaka, Rukhadze street",
        topicId: rentTopic.id,
        listingDate: new Date("2026-05-11T16:00:00.000Z"),
      },
      {
        ssGeId: "SS-3550",
        source: ListingSource.SS_GE,
        district: District.GLDANI,
        status: ListingStatus.LISTED,
        cooperation: 100,
        phone: "599 000 111",
        rooms: 4,
        floor: 9,
        apartment: 44,
        priceGEL: 200000,
        priceFactor: 1.0,
        address: "Gldani 8th block",
        topicId: saleTopic.id,
        listingDate: new Date("2026-05-10T14:10:00.000Z"),
      },
      {
        myhomeId: "22000111",
        source: ListingSource.MYHOME,
        district: District.SABURTALO,
        status: ListingStatus.FOR_RENT,
        cooperation: 100,
        phone: "555 555 555",
        rooms: 3,
        floor: 11,
        apartment: 50,
        priceGEL: 1800,
        priceFactor: 1.1,
        address: "Saburtalo, Kazbegi avenue",
        topicId: rentTopic.id,
        listingDate: new Date("2026-05-10T09:45:00.000Z"),
      },
    ],
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
