import MapPageClient from "@/components/MapPageClient";
import { loadEcosystemPoints } from "@/lib/data";

export default async function HomePage() {
  const ecosystemPoints = await loadEcosystemPoints();

  return <MapPageClient ecosystemPoints={ecosystemPoints} />;
}
