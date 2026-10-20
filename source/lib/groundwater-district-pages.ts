import type { GcdDistrictId } from "@/lib/gcd-intelligence";

export type GroundwaterDistrictPage = {
  slug: string;
  name: string;
  shortName: string;
  waterWatchId?: GcdDistrictId;
};

export const legacyGroundwaterDistrictPages: readonly GroundwaterDistrictPage[] = [
  { slug: "barton-springs-edwards-aquifer-conservation-district", name: "Barton Springs/Edwards Aquifer Conservation District", shortName: "Barton Springs/Edwards Aquifer District", waterWatchId: "barton_springs_edwards_aquifer_conservation_district" },
  { slug: "comal-trinity-gcd", name: "Comal Trinity Groundwater Conservation District", shortName: "Comal Trinity GCD", waterWatchId: "comal_trinity_gcd" },
  { slug: "evergreen-uwcd", name: "Evergreen Underground Water Conservation District", shortName: "Evergreen UWCD" },
  { slug: "gonzales-county-uwcd", name: "Gonzales County Underground Water Conservation District", shortName: "Gonzales County UWCD" },
  { slug: "kinney-county-gcd", name: "Kinney County Groundwater Conservation District", shortName: "Kinney County GCD", waterWatchId: "kinney_county_gcd" },
  { slug: "lost-pines-gcd", name: "Lost Pines Groundwater Conservation District", shortName: "Lost Pines GCD" },
  { slug: "north-plains-gcd", name: "North Plains Groundwater Conservation District", shortName: "North Plains GCD", waterWatchId: "north_plains_gcd" },
  { slug: "northern-trinity-gcd", name: "Northern Trinity Groundwater Conservation District", shortName: "Northern Trinity GCD", waterWatchId: "northern_trinity_gcd" },
  { slug: "prairielands-gcd", name: "Prairielands Groundwater Conservation District", shortName: "Prairielands GCD" },
  { slug: "reeves-county-gcd", name: "Reeves County Groundwater Conservation District", shortName: "Reeves County GCD", waterWatchId: "reeves_county_gcd" },
  { slug: "southwestern-travis-county-gcd", name: "Southwestern Travis County Groundwater Conservation District", shortName: "Southwestern Travis County GCD", waterWatchId: "southwestern_travis_county_gcd" },
  { slug: "upper-trinity-gcd", name: "Upper Trinity Groundwater Conservation District", shortName: "Upper Trinity GCD", waterWatchId: "upper_trinity_gcd" },
] as const;

export function getLegacyGroundwaterDistrictPage(slug: string) {
  return legacyGroundwaterDistrictPages.find((district) => district.slug === slug);
}
