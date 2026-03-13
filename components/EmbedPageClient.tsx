"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import Map from "@/components/Map";
import { ECOSYSTEM_META, ECOSYSTEM_ORDER } from "@/lib/ecosystemConfig";
import { EcosystemPoint, EcosystemType } from "@/lib/types";

interface EmbedPageClientProps {
  ecosystemPoints: EcosystemPoint[];
}

function buildInitialState(points: EcosystemPoint[]): Record<EcosystemType, boolean> {
  const initial: Record<EcosystemType, boolean> = {
    vc: false,
    ai: false,
    ai_bio: false,
    fintech: false,
    web3: false,
    coworking: false,
    edu: false,
    big_tech: false,
    funding: false
  };

  points.forEach((point) => {
    initial[point.type] = true;
  });

  return initial;
}

const DEFAULT_VISIBLE_TYPES: EcosystemType[] = ["vc", "funding", "ai", "ai_bio", "fintech", "web3", "coworking", "edu", "big_tech"];

export default function EmbedPageClient({ ecosystemPoints }: EmbedPageClientProps) {
  const searchParams = useSearchParams();

  // Parse URL params for filtering
  const categoryParam = searchParams.get("category");
  const categoriesParam = searchParams.get("categories");

  const [enabledByType, setEnabledByType] = useState<Record<EcosystemType, boolean>>(() => {
    const initial = buildInitialState(ecosystemPoints);

    // If specific categories are requested via URL params
    if (categoryParam || categoriesParam) {
      const requestedCategories = categoryParam
        ? [categoryParam as EcosystemType]
        : (categoriesParam?.split(',') as EcosystemType[] || []);

      // Set all to false first
      Object.keys(initial).forEach(key => {
        initial[key as EcosystemType] = false;
      });

      // Enable only requested categories
      requestedCategories.forEach(cat => {
        if (cat in initial) {
          initial[cat as EcosystemType] = true;
        }
      });

      return initial;
    }

    // Default: show all
    const hasAny = Object.values(initial).some(Boolean);
    if (hasAny) return initial;
    return {
      ...initial,
      vc: true,
      ai: true,
      ai_bio: true,
      fintech: true,
      web3: true,
      edu: true,
      big_tech: true
    };
  });

  const availableTypes = useMemo(
    () => {
      const fromData = ECOSYSTEM_ORDER.filter((type) => ecosystemPoints.some((point) => point.type === type));
      return fromData.length ? fromData : DEFAULT_VISIBLE_TYPES;
    },
    [ecosystemPoints]
  );

  const enabledTypes = useMemo(
    () => availableTypes.filter((type) => enabledByType[type]),
    [availableTypes, enabledByType]
  );

  return (
    <main className="shell embed-mode">
      <nav className="embed-legend" aria-label="Map layers">
        {availableTypes.map((type) => {
          const isOn = enabledByType[type];
          return (
            <button
              key={type}
              type="button"
              className={isOn ? "legend-btn active" : "legend-btn"}
              onClick={() => setEnabledByType((state) => ({ ...state, [type]: !state[type] }))}
            >
              <span className="dot" style={{ background: isOn ? ECOSYSTEM_META[type].color : "transparent", borderColor: ECOSYSTEM_META[type].color }} aria-hidden="true" />
              {ECOSYSTEM_META[type].label}
            </button>
          );
        })}
      </nav>
      <Map ecosystemPoints={ecosystemPoints} enabledTypes={enabledTypes} />
    </main>
  );
}
