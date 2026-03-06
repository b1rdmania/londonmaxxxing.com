import { EcosystemType } from "@/lib/types";

export const ECOSYSTEM_ORDER: EcosystemType[] = ["vc", "ai", "fintech", "web3", "edu", "tech"];

export const ECOSYSTEM_META: Record<EcosystemType, { label: string; color: string }> = {
  vc: { label: "VC", color: "#3b82f6" },
  ai: { label: "AI", color: "#ec4899" },
  fintech: { label: "Fintech", color: "#10b981" },
  web3: { label: "Web3", color: "#f59e0b" },
  edu: { label: "Education", color: "#8b5cf6" },
  tech: { label: "Tech", color: "#334155" }
};
