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
    funding: false,
    ai: false,
    ai_bio: false,
    fintech: false,
    web3: false,
    coworking: false,
    edu: false,
    big_tech: false
  };

  points.forEach((point) => {
    initial[point.type] = true;
  });

  return initial;
}

const DEFAULT_VISIBLE_TYPES: EcosystemType[] = ["vc", "funding", "ai", "ai_bio", "fintech", "web3", "coworking", "edu", "big_tech"];

export default function MapPageClient({ ecosystemPoints }: MapPageClientProps) {
  const [enabledByType, setEnabledByType] = useState<Record<EcosystemType, boolean>>(() => {
    const initial = buildInitialState(ecosystemPoints);
    const hasAny = Object.values(initial).some(Boolean);
    if (hasAny) return initial;
    return {
      ...initial,
      vc: true,
      funding: true,
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
    <main className="shell">
      <header className="topbar">
        <div className="topbar-brand">
          <h1>London tech heatmap 🔥</h1>
          <span className="topbar-cta">
            [By{" "}
            <a href="https://x.com/b1rdmania" target="_blank" rel="noreferrer">
              b1rdmania
            </a>
            ] [{ecosystemPoints.length} so far]<span className="share-embed-links"> [
            <a
              href="https://x.com/intent/tweet?text=London%20tech%20ecosystem%20map%20%E2%80%94%20251%2B%20AI%20labs%2C%20VCs%2C%20fintechs%2C%20and%20startups%20%F0%9F%94%A5%0A%0Aby%20%40b1rdmania&url=https%3A%2F%2Flondonmaxxxing.com"
              target="_blank"
              rel="noreferrer"
            >
              Share
            </a>
            {" / "}
            <a href="/embed-code" target="_blank" rel="noreferrer">
              Embed
            </a>
            ]</span>
          </span>
        </div>
        <nav className="topbar-nav" aria-label="Map layers">
          <span className="topbar-cta topbar-toggle-label">toggle:</span>
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
