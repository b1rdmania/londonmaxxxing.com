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
          <h1>LONDONMAXXXING.COM</h1>
          <p>infrastructure map // shoreditch office availability</p>
        </div>
      </header>

      <section className="map-shell">
        <div className="layer-controls">
          <h2>[ LAYERS ]</h2>
          <label>
            <input type="checkbox" checked={showVcOverlay} onChange={(e) => setShowVcOverlay(e.target.checked)} />
            VC offices
          </label>
          <label>
            <input type="checkbox" checked={showTechOverlay} onChange={(e) => setShowTechOverlay(e.target.checked)} />
            Tech offices
          </label>
          <p>green/amber/red = low/mid/high monthly cost</p>
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
