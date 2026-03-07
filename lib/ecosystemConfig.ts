import { EcosystemType } from "@/lib/types";

export const ECOSYSTEM_ORDER: EcosystemType[] = ["vc", "ai", "ai_bio", "fintech", "web3", "coworking", "edu", "big_tech"];

export const ECOSYSTEM_META: Record<EcosystemType, { label: string; color: string }> = {
  vc: { label: "VC", color: "#3b82f6" },
  ai: { label: "AI", color: "#ec4899" },
  ai_bio: { label: "AI x Bio", color: "#06b6d4" },
  fintech: { label: "Fintech", color: "#10b981" },
  web3: { label: "Web3", color: "#f59e0b" },
  coworking: { label: "Coworking", color: "#ef4444" },
  edu: { label: "Education", color: "#8b5cf6" },
  big_tech: { label: "Big Tech", color: "#334155" }
};
