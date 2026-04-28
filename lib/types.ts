export type TopicDto = {
  id: number;
  nameKa: string;
  nameEn: string;
};

export type ListingUserDto = {
  id: number;
  name: string | null;
  email: string;
};

export type ListingDto = {
  id: number;
  myhomeId: string | null;
  ssGeId: string | null;
  source: "MYHOME" | "SS_GE";
  district: "GLDANI" | "SABURTALO" | "NAKHALOVAKA" | "OTHER";
  status: "FOR_RENT" | "RENTED" | "LISTED" | "MEETING_SCHEDULED";
  category: "RENT" | "SALE" | "COMMERCIAL";
  cooperation: number;
  phone: string | null;
  tenantName: string | null;
  rooms: number | null;
  floor: number | null;
  apartment: number | null;
  areaSqm: number | null;
  priceGEL: number | null;
  priceFactor: number | null;
  address: string | null;
  comment: string | null;
  listingDate: string;
  createdAt: string;
  topicId: number | null;
  topic: TopicDto | null;
  createdById: number | null;
  createdBy: ListingUserDto | null;
};

export type ListingsResponse = {
  listings: ListingDto[];
};

export type TopicsResponse = {
  topics: TopicDto[];
};

export type TeamMemberDto = {
  id: number;
  user: ListingUserDto;
};

export type TeamDto = {
  id: number;
  name: string;
  members: TeamMemberDto[];
  createdAt: string;
};

export type TeamsResponse = {
  teams: TeamDto[];
};

export type CompanyUsersResponse = {
  users: ListingUserDto[];
};
