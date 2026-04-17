export type TopicDto = {
  id: number;
  nameKa: string;
  nameEn: string;
};

export type ListingDto = {
  id: number;
  myhomeId: string | null;
  ssGeId: string | null;
  source: "MYHOME" | "SS_GE";
  district: "GLDANI" | "SABURTALO" | "NAKHALOVAKA" | "OTHER";
  status: "FOR_RENT" | "RENTED" | "LISTED";
  cooperation: number;
  phone: string | null;
  tenantName: string | null;
  rooms: number | null;
  floor: number | null;
  apartment: number | null;
  priceGEL: number | null;
  priceFactor: number | null;
  address: string | null;
  listingDate: string;
  createdAt: string;
  topicId: number | null;
  topic: TopicDto | null;
};

export type ListingsResponse = {
  listings: ListingDto[];
};

export type TopicsResponse = {
  topics: TopicDto[];
};
