import EmbedCodeGenerator from "@/components/EmbedCodeGenerator";
import { loadEcosystemPoints } from "@/lib/data";

export const metadata = {
  title: "Embed Code Generator - London Tech Heatmap",
  description: "Get the embed code to add the London tech ecosystem map to your website"
};

export default async function EmbedCodePage() {
  const ecosystemPoints = await loadEcosystemPoints();

  return <EmbedCodeGenerator ecosystemPoints={ecosystemPoints} />;
}
