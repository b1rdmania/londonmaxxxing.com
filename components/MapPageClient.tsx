"use client";

import { useMemo, useState } from "react";

import Map from "@/components/Map";
import { ECOSYSTEM_META, ECOSYSTEM_ORDER } from "@/lib/ecosystemConfig";
import { EcosystemPoint, EcosystemType } from "@/lib/types";

interface MapPageClientProps {
  ecosystemPoints: EcosystemPoint[];
}

function buildInitialState(points: EcosystemPoint[]): Record<EcosystemType, boolean> {
  const initial: Record<EcosystemType, boolean> = {
    vc: false,
    ai: false,
    fintech: false,
    web3: false,
    edu: false,
    tech: false
  };

  points.forEach((point) => {
    initial[point.type] = true;
  });

  return initial;
}

const DEFAULT_VISIBLE_TYPES: EcosystemType[] = ["vc", "ai", "fintech", "web3", "edu"];

export default function MapPageClient({ ecosystemPoints }: MapPageClientProps) {
  const [enabledByType, setEnabledByType] = useState<Record<EcosystemType, boolean>>(() => {
    const initial = buildInitialState(ecosystemPoints);
    const hasAny = Object.values(initial).some(Boolean);
    if (hasAny) return initial;
    return {
      ...initial,
      vc: true,
      ai: true,
      fintech: true,
      web3: true,
      edu: true
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
    <main className="shell">
      <header className="topbar">
        <div className="topbar-brand">
          <h1>London Tech heat map 🔥</h1>
        </div>
        <nav className="topbar-nav" aria-label="Map layers">
          <a className="topbar-cta" href="mailto:birdandy@me.com?subject=You%20forgot%20us!">
            your company here and then here
          </a>
          {availableTypes.map((type) => {
            const isOn = enabledByType[type];
            return (
              <button
                key={type}
                type="button"
                className={isOn ? "topbar-btn active" : "topbar-btn"}
                onClick={() => setEnabledByType((state) => ({ ...state, [type]: !state[type] }))}
              >
                <span className="dot" style={{ background: isOn ? ECOSYSTEM_META[type].color : "transparent", borderColor: ECOSYSTEM_META[type].color }} aria-hidden="true" />
                {ECOSYSTEM_META[type].label}
              </button>
            );
          })}
        </nav>
      </header>

      <section className="map-shell">
        <Map ecosystemPoints={ecosystemPoints} enabledTypes={enabledTypes} />
      </section>
    </main>
  );
}
