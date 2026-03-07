export type OfficeType = "serviced" | "managed" | "coworking";

export type AvailabilityBucket = "now" | "next_3_months" | "flexible";

export type DeskBucket = "1_4" | "4_10" | "10_20" | "20_plus";

export type BudgetBucket = "lt_2k" | "2k_5k" | "5k_10k" | "10k_plus";

export type EcosystemType = "vc" | "ai" | "fintech" | "web3" | "edu" | "big_tech" | "ai_bio" | "coworking" | "funding";

export interface OfficeListing {
  id: string;
  name: string;
  address: string;
  postcode: string;
  latitude: number;
  longitude: number;
  office_type: OfficeType;
  desk_count: number;
  area_sqft?: number;
  monthly_cost: number;
  cost_per_desk?: number;
  cost_per_sqft?: number;
  availability_date: string;
  lease_term: string;
  broker_name: string;
  source_url: string;
  notes?: string;
}

export interface EcosystemPoint {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: EcosystemType;
  source_url: string;
  website?: string;
  notes?: string;
  twitter?: string;
}

export interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface FiltersState {
  desk: DeskBucket | "any";
  budget: BudgetBucket | "any";
  officeType: OfficeType | "any";
  availability: AvailabilityBucket | "any";
  vcOverlay: boolean;
  techOverlay: boolean;
}
