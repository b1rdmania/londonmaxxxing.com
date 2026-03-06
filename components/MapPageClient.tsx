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
  const vcCount = ecosystemPoints.filter((point) => point.type === "vc").length;
  const techCount = ecosystemPoints.filter((point) => point.type === "tech").length;

  return (
    <main className="shell">
      <header className="topbar">
        <div className="status-line">
          {`> ready // vc:${showVcOverlay ? "on" : "off"} tech:${showTechOverlay ? "on" : "off"} office:${showOfficeLayer ? "on" : "off"}`}
        </div>
        <div className="topbar-brand">
          <h1>LONDONMAXXXING.COM</h1>
          <p>london startup ecosystem map</p>
        </div>
        <nav className="topbar-nav" aria-label="Map layers">
          <button
            type="button"
            className={showVcOverlay ? "topbar-btn active" : "topbar-btn"}
            onClick={() => setShowVcOverlay((value) => !value)}
          >
            [{showVcOverlay ? "x" : " "}] vc {vcCount}
          </button>
          <button
            type="button"
            className={showTechOverlay ? "topbar-btn active" : "topbar-btn"}
            onClick={() => setShowTechOverlay((value) => !value)}
          >
            [{showTechOverlay ? "x" : " "}] tech {techCount}
          </button>
          <button
            type="button"
            className={showOfficeLayer ? "topbar-btn active" : "topbar-btn"}
            onClick={() => setShowOfficeLayer((value) => !value)}
          >
            [{showOfficeLayer ? "x" : " "}] office (w2)
          </button>
        </nav>
        <div className="topbar-meta">
          <span>{listings.length} office listings indexed</span>
        </div>
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
