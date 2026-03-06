"use client";

import { useState } from "react";

import Map from "@/components/Map";
import { EcosystemPoint, OfficeListing } from "@/lib/types";

interface MapPageClientProps {
  listings: OfficeListing[];
  ecosystemPoints: EcosystemPoint[];
}

export default function MapPageClient({ listings, ecosystemPoints }: MapPageClientProps) {
  const [showOfficeLayer, setShowOfficeLayer] = useState(false);
  const [showVcOverlay, setShowVcOverlay] = useState(true);
  const [showTechOverlay, setShowTechOverlay] = useState(true);
  const hasOfficeData = listings.length > 0;
  const hasVcData = ecosystemPoints.some((point) => point.type === "vc");
  const hasTechData = ecosystemPoints.some((point) => point.type === "tech");

  return (
    <main className="shell">
      <header className="topbar">
        <div className="topbar-brand">
          <h1>London Tech Map</h1>
          <p>London Tech heat map</p>
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
          <button
            type="button"
            className={showOfficeLayer ? "topbar-btn active" : "topbar-btn"}
            onClick={() => setShowOfficeLayer((value) => !value)}
            disabled={!hasOfficeData}
          >
            <span className="dot dot-office" aria-hidden="true" />
            Office
          </button>
        </nav>
      </header>

      <section className="map-shell">
        <Map
          listings={listings}
          ecosystemPoints={ecosystemPoints}
          showOfficeLayer={showOfficeLayer}
          showVcOverlay={showVcOverlay}
          showTechOverlay={showTechOverlay}
        />
      </section>
    </main>
  );
}
