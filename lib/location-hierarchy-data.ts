import type { ListingDto } from "./types";
import { TBILISI_GROUPS, TbilisiArea } from "./tbilisi-location-data";
import { CITY_STREET_TITLES } from "./city-street-titles.generated";

export type LocationStreetRaw = {
  id: string;
  nameKa: string;
  nameEn: string;
};

export type LocationSubAreaRaw = {
  id: string;
  nameKa: string;
  nameEn: string;
  streets?: LocationStreetRaw[];
};

export type LocationAreaRaw = {
  id: string;
  nameKa: string;
  nameEn: string;
  subAreas?: LocationSubAreaRaw[];
  streets?: LocationStreetRaw[];
};

export type LocationGroupRaw = {
  id: string;
  nameKa: string;
  nameEn: string;
  district: ListingDto["district"];
  areas: LocationAreaRaw[];
};

export type LocationCityRaw = {
  id: string;
  nameKa: string;
  nameEn: string;
  groups: LocationGroupRaw[];
};

function buildStreetDirectory(
  cityKey: keyof typeof CITY_STREET_TITLES,
  prefix: string,
): LocationStreetRaw[] {
  return CITY_STREET_TITLES[cityKey].map((nameKa, index) => ({
    id: `${prefix}_${String(index + 1).padStart(4, "0")}`,
    nameKa,
    nameEn: nameKa,
  }));
}

function tbilisiAreaToRaw(area: TbilisiArea): LocationAreaRaw {
  return {
    id: area.id,
    nameKa: area.nameKa,
    nameEn: area.nameKa,
    streets: area.streets.map((nameKa, index) => ({
      id: `${area.id}_ST_${String(index + 1).padStart(4, "0")}`,
      nameKa,
      nameEn: nameKa,
    })),
  };
}

const TBILISI_GROUPS_RAW: LocationGroupRaw[] = TBILISI_GROUPS.map((group) => ({
  id: group.id,
  nameKa: group.nameKa,
  nameEn: group.nameKa,
  district: group.district,
  areas: group.areas.map(tbilisiAreaToRaw),
}));

export const LOCATION_CITIES_RAW: LocationCityRaw[] = [
  {
    id: "TBILISI",
    nameKa: "თბილისი",
    nameEn: "Tbilisi",
    groups: TBILISI_GROUPS_RAW,
  },
  {
    id: "BATUMI",
    nameKa: "ბათუმი",
    nameEn: "Batumi",
    groups: [
      {
        id: "BATUMI_AREAS",
        nameKa: "ბათუმის უბნები",
        nameEn: "Batumi Areas",
        district: "OTHER",
        areas: [
          {
            id: "BATUMI_STREETS",
            nameKa: "ბათუმის ქუჩები",
            nameEn: "Batumi Streets",
            streets: buildStreetDirectory("BATUMI", "BATUMI_STREET"),
          },
        ],
      },
    ],
  },
  {
    id: "KUTAISI",
    nameKa: "ქუთაისი",
    nameEn: "Kutaisi",
    groups: [
      {
        id: "KUTAISI_AREAS",
        nameKa: "ქუთაისის უბნები",
        nameEn: "Kutaisi Areas",
        district: "OTHER",
        areas: [
          {
            id: "KUTAISI_STREETS",
            nameKa: "ქუთაისის ქუჩები",
            nameEn: "Kutaisi Streets",
            streets: buildStreetDirectory("KUTAISI", "KUTAISI_STREET"),
          },
        ],
      },
    ],
  },
  {
    id: "RUSTAVI",
    nameKa: "რუსთავი",
    nameEn: "Rustavi",
    groups: [
      {
        id: "RUSTAVI_AREAS",
        nameKa: "რუსთავის უბნები",
        nameEn: "Rustavi Areas",
        district: "OTHER",
        areas: [
          {
            id: "RUSTAVI_STREETS",
            nameKa: "რუსთავის ქუჩები",
            nameEn: "Rustavi Streets",
            streets: buildStreetDirectory("RUSTAVI", "RUSTAVI_STREET"),
          },
        ],
      },
    ],
  },
  {
    id: "TELAVI",
    nameKa: "თელავი",
    nameEn: "Telavi",
    groups: [
      {
        id: "TELAVI_AREAS",
        nameKa: "თელავის უბნები",
        nameEn: "Telavi Areas",
        district: "OTHER",
        areas: [
          {
            id: "TELAVI_STREETS",
            nameKa: "თელავის ქუჩები",
            nameEn: "Telavi Streets",
            streets: buildStreetDirectory("TELAVI", "TELAVI_STREET"),
          },
        ],
      },
    ],
  },
  {
    id: "BAKURIANI",
    nameKa: "ბაკურიანი",
    nameEn: "Bakuriani",
    groups: [
      {
        id: "BAKURIANI_AREAS",
        nameKa: "ბაკურიანის ზონები",
        nameEn: "Bakuriani Zones",
        district: "OTHER",
        areas: [
          {
            id: "BAKURIANI_STREETS",
            nameKa: "ბაკურიანის ქუჩები",
            nameEn: "Bakuriani Streets",
            streets: buildStreetDirectory("BAKURIANI", "BAKURIANI_STREET"),
          },
        ],
      },
    ],
  },
];
