import { EcosystemType } from "@/lib/types";

export const ECOSYSTEM_ORDER: EcosystemType[] = ["vc", "ai", "fintech", "web3", "edu", "tech"];

export const ECOSYSTEM_META: Record<EcosystemType, { label: string; color: string }> = {
  vc: { label: "VC", color: "#2f62ff" },
  ai: { label: "AI", color: "#c026d3" },
  fintech: { label: "Fintech", color: "#0f766e" },
  web3: { label: "Web3", color: "#f97316" },
  edu: { label: "Education", color: "#b45309" },
  tech: { label: "Tech", color: "#ff7b22" }
};
