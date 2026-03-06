import { Bounds, BudgetBucket, DeskBucket, FiltersState, OfficeListing } from "@/lib/types";

interface GeoJsonFeatureCollection {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: Record<string, string | number | undefined>;
    geometry: {
      type: "Point";
      coordinates: [number, number];
    };
  }>;
}

function getPriceTier(monthlyCost: number): number {
  if (monthlyCost < 5000) return 0;
  if (monthlyCost < 10000) return 1;
  return 2;
}

export function toGeoJson(listings: OfficeListing[]): GeoJsonFeatureCollection {
  return {
    type: "FeatureCollection",
    features: listings.map((listing) => ({
      type: "Feature",
      properties: {
        id: listing.id,
        name: listing.name,
        address: listing.address,
        desk_count: listing.desk_count,
        monthly_cost: listing.monthly_cost,
        cost_per_desk: listing.cost_per_desk,
        availability_date: listing.availability_date,
        broker_name: listing.broker_name,
        source_url: listing.source_url,
        office_type: listing.office_type,
        price_tier: getPriceTier(listing.monthly_cost)
      },
      geometry: {
        type: "Point",
        coordinates: [listing.longitude, listing.latitude]
      }
    }))
  };
}

function matchesDeskBucket(deskCount: number, bucket: DeskBucket | "any"): boolean {
  if (bucket === "any") return true;
  if (bucket === "1_4") return deskCount >= 1 && deskCount <= 4;
  if (bucket === "4_10") return deskCount >= 4 && deskCount <= 10;
  if (bucket === "10_20") return deskCount >= 10 && deskCount <= 20;
  return deskCount >= 20;
}

function matchesBudgetBucket(monthlyCost: number, bucket: BudgetBucket | "any"): boolean {
  if (bucket === "any") return true;
  if (bucket === "lt_2k") return monthlyCost < 2000;
  if (bucket === "2k_5k") return monthlyCost >= 2000 && monthlyCost <= 5000;
  if (bucket === "5k_10k") return monthlyCost > 5000 && monthlyCost <= 10000;
  return monthlyCost > 10000;
}

export function applyFilters(listings: OfficeListing[], filters: FiltersState): OfficeListing[] {
  return listings.filter((listing) => {
    const deskMatch = matchesDeskBucket(listing.desk_count, filters.desk);
    const budgetMatch = matchesBudgetBucket(listing.monthly_cost, filters.budget);
    const officeMatch = filters.officeType === "any" || listing.office_type === filters.officeType;
    const availabilityMatch =
      filters.availability === "any" ||
      (filters.availability === "now" && listing.availability_date === "Now") ||
      (filters.availability === "next_3_months" && listing.availability_date === "Next 3 months") ||
      (filters.availability === "flexible" && listing.availability_date === "Flexible");

    return deskMatch && budgetMatch && officeMatch && availabilityMatch;
  });
}

export function filterByBounds(listings: OfficeListing[], bounds: Bounds | null): OfficeListing[] {
  if (!bounds) return listings;

  return listings.filter((listing) => {
    const inLat = listing.latitude <= bounds.north && listing.latitude >= bounds.south;
    const inLng = listing.longitude <= bounds.east && listing.longitude >= bounds.west;
    return inLat && inLng;
  });
}

export function formatGBP(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0
  }).format(value);
}
