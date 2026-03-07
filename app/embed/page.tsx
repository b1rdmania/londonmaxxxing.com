import { Suspense } from "react";
import EmbedPageClient from "@/components/EmbedPageClient";
import { loadEcosystemPoints } from "@/lib/data";

export default async function EmbedPage() {
  const ecosystemPoints = await loadEcosystemPoints();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmbedPageClient ecosystemPoints={ecosystemPoints} />
    </Suspense>
  );
}
