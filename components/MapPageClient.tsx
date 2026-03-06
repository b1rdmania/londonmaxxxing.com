"use client";

import { useState } from "react";

import Map from "@/components/Map";
import { EcosystemPoint } from "@/lib/types";

interface MapPageClientProps {
  ecosystemPoints: EcosystemPoint[];
}

export default function MapPageClient({ ecosystemPoints }: MapPageClientProps) {
  const [showVcOverlay, setShowVcOverlay] = useState(true);
  const [showTechOverlay, setShowTechOverlay] = useState(true);
  const hasVcData = ecosystemPoints.some((point) => point.type === "vc");
  const hasTechData = ecosystemPoints.some((point) => point.type === "tech");

  return (
    <main className="shell">
      <header className="topbar">
        <div className="topbar-brand">
          <h1>London Tech heat map 🔥</h1>
        </div>
        <nav className="topbar-nav" aria-label="Map layers">
          <button
            type="button"
            className={showVcOverlay ? "topbar-btn active" : "topbar-btn"}
            onClick={() => setShowVcOverlay((value) => !value)}
            disabled={!hasVcData}
          >
            <span className="dot dot-vc" aria-hidden="true" />
            VC
          </button>
          <button
            type="button"
            className={showTechOverlay ? "topbar-btn active" : "topbar-btn"}
            onClick={() => setShowTechOverlay((value) => !value)}
            disabled={!hasTechData}
          >
            <span className="dot dot-tech" aria-hidden="true" />
            Tech
          </button>
        </nav>
      </header>

      <section className="map-shell">
        <Map
          ecosystemPoints={ecosystemPoints}
          showVcOverlay={showVcOverlay}
          showTechOverlay={showTechOverlay}
        />
      </section>
    </main>
  );
}
