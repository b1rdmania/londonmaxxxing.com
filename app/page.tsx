import MapPageClient from "@/components/MapPageClient";
import { loadEcosystemPoints, loadOfficeListings } from "@/lib/data";

export default async function HomePage() {
  const [listings, ecosystemPoints] = await Promise.all([loadOfficeListings(), loadEcosystemPoints()]);

  return <MapPageClient listings={listings} ecosystemPoints={ecosystemPoints} />;
}
