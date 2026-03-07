import "server-only";

import { promises as fs } from "fs";
import path from "path";

import { EcosystemPoint, EcosystemType, OfficeListing, OfficeType } from "@/lib/types";

const OFFICE_TYPES: ReadonlySet<OfficeType> = new Set(["serviced", "managed", "coworking"]);
const ECO_TYPES: ReadonlySet<EcosystemType> = new Set(["vc", "funding", "ai", "ai_bio", "fintech", "web3", "coworking", "edu", "big_tech"]);

function parseCsv(text: string): Array<Record<string, string>> {
  const rows: string[][] = [];
  let current = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current.trim());
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(current.trim());
      current = "";
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current.trim());
    if (row.some((value) => value.length > 0)) rows.push(row);
  }

  if (!rows.length) return [];

  const [headers, ...dataRows] = rows;
  return dataRows.map((values) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = values[index] ?? "";
    });
    return record;
  });
}

function parseNumber(value: string): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseOptionalNumber(value: string): number | undefined {
  const parsed = parseNumber(value);
  return parsed === null ? undefined : parsed;
}

function toOfficeListing(record: Record<string, string>): OfficeListing | null {
  const officeType = record.office_type as OfficeType;
  if (!OFFICE_TYPES.has(officeType)) return null;

  const latitude = parseNumber(record.latitude);
  const longitude = parseNumber(record.longitude);
  const deskCount = parseNumber(record.desk_count);
  const monthlyCost = parseNumber(record.monthly_cost);

  if (latitude === null || longitude === null || deskCount === null || monthlyCost === null) {
    return null;
  }

  const areaSqft = parseOptionalNumber(record.area_sqft);
  const derivedCostPerDesk = Math.round(monthlyCost / deskCount);
  const derivedCostPerSqft = areaSqft
    ? Math.round(((monthlyCost * 12) / areaSqft) * 100) / 100
    : undefined;

  return {
    id: record.id,
    name: record.name,
    address: record.address,
    postcode: record.postcode,
    latitude,
    longitude,
    office_type: officeType,
    desk_count: deskCount,
    area_sqft: areaSqft,
    monthly_cost: monthlyCost,
    cost_per_desk: parseOptionalNumber(record.cost_per_desk) ?? derivedCostPerDesk,
    cost_per_sqft: parseOptionalNumber(record.cost_per_sqft) ?? derivedCostPerSqft,
    availability_date: record.availability_date,
    lease_term: record.lease_term,
    broker_name: record.broker_name,
    source_url: record.source_url,
    notes: record.notes || undefined
  };
}

function toEcosystemPoint(record: Record<string, string>): EcosystemPoint | null {
  const rawType = (record.category || record.type || "").trim().toLowerCase();
  const type = rawType as EcosystemType;
  if (!ECO_TYPES.has(type)) return null;

  const latitude = parseNumber(record.latitude);
  const longitude = parseNumber(record.longitude);
  if (latitude === null || longitude === null) return null;

  const addressParts = [record.address, record.city, record.postcode, record.country]
    .map((part) => part?.trim())
    .filter((part, index, arr) => Boolean(part) && arr.indexOf(part) === index);
  const fullAddress = addressParts.join(", ");

  return {
    id: record.id,
    name: record.name,
    address: fullAddress || record.address,
    latitude,
    longitude,
    type,
    source_url: record.source_url,
    website: record.website || undefined,
    notes: record.notes || undefined,
    twitter: record.twitter || undefined
  };
}

async function readCsv(fileName: string): Promise<Array<Record<string, string>>> {
  const fullPath = path.join(process.cwd(), fileName);
  const file = await fs.readFile(fullPath, "utf8");
  return parseCsv(file);
}

export async function loadOfficeListings(): Promise<OfficeListing[]> {
  const records = await readCsv("office-listings.csv");
  return records.map(toOfficeListing).filter((row): row is OfficeListing => row !== null);
}

export async function loadEcosystemPoints(): Promise<EcosystemPoint[]> {
  const records = await readCsv("data/ecosystem.csv");
  return records.map(toEcosystemPoint).filter((row): row is EcosystemPoint => row !== null);
}
