"use client";

import { useState } from "react";

import Map from "@/components/Map";
import { ecosystemPoints, officeListings } from "@/lib/data";

export default function HomePage() {
  const [showVcOverlay, setShowVcOverlay] = useState(false);
  const [showTechOverlay, setShowTechOverlay] = useState(false);

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <h1>Londonmaxxxing.com</h1>
          <p>Map the London tech ecosystem.</p>
        </div>
      </header>

      <section className="map-shell">
        <div className="layer-controls">
          <h2>Layers</h2>
          <label>
            <input type="checkbox" checked={showVcOverlay} onChange={(e) => setShowVcOverlay(e.target.checked)} />
            VC offices
          </label>
          <label>
            <input type="checkbox" checked={showTechOverlay} onChange={(e) => setShowTechOverlay(e.target.checked)} />
            Tech offices
          </label>
          <p>Green/amber/red office markers show lower/mid/higher monthly cost.</p>
        </div>

        <Map
          listings={officeListings}
          ecosystemPoints={ecosystemPoints}
          showVcOverlay={showVcOverlay}
          showTechOverlay={showTechOverlay}
        />
      </section>
    </main>
  );
}
