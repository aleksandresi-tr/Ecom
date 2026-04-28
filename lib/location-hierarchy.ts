import { LOCATION_CITIES_RAW } from "./location-hierarchy-data";

function pick(locale: string, ka: string, en: string) {
  return locale.startsWith("ka") ? ka : en;
}

export function getLocationHierarchy(locale: string) {
  return LOCATION_CITIES_RAW.map((city) => ({
    id: city.id,
    label: pick(locale, city.nameKa, city.nameEn),
    groups: city.groups.map((group) => ({
      id: group.id,
      district: group.district,
      label: pick(locale, group.nameKa, group.nameEn),
      areas: group.areas.map((area) => ({
        id: area.id,
        label: pick(locale, area.nameKa, area.nameEn),
        streets: (area.streets ?? []).map((street) => ({
          id: street.id,
          label: pick(locale, street.nameKa, street.nameEn),
        })),
        subAreas: (area.subAreas ?? []).map((subArea) => ({
          id: subArea.id,
          label: pick(locale, subArea.nameKa, subArea.nameEn),
          streets: (subArea.streets ?? []).map((street) => ({
            id: street.id,
            label: pick(locale, street.nameKa, street.nameEn),
          })),
        })),
      })),
    })),
  }));
}
