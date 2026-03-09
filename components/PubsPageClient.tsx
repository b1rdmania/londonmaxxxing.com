"use client";

import { useState } from "react";
import { Map, Marker, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import pubsData from "@/data/pubs.json";

interface Pub {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  reviews: number;
  mapsUrl: string;
  website: string | null;
}

export default function PubsPageClient() {
  const [selectedPub, setSelectedPub] = useState<Pub | null>(null);

  const initialViewState = {
    longitude: -0.1278,
    latitude: 51.5074,
    zoom: 12
  };

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
            ] [<span className="mobile-hide">{pubsData.pubs.length} pubs</span><span className="mobile-hide">] [</span>
            <a href="/">Map</a>
            ] [
            <a href="/events">Events</a>
            ] [
            <a href="/pubs">Pubs</a>
            ]
          </span>
        </div>
      </header>

      <div className="map-shell">
        <div className="map-wrap">
          <Map
            initialViewState={initialViewState}
            style={{ width: "100%", height: "100%" }}
            mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
          >
            {pubsData.pubs.map((pub: Pub) => (
              <Marker
                key={pub.id}
                longitude={pub.lng}
                latitude={pub.lat}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedPub(pub);
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    cursor: "pointer",
                    transition: "transform 0.2s ease"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.3)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  🍺
                </div>
              </Marker>
            ))}

            {selectedPub && (
              <Popup
                longitude={selectedPub.lng}
                latitude={selectedPub.lat}
                anchor="top"
                onClose={() => setSelectedPub(null)}
                closeOnClick={false}
              >
                <div style={{ padding: "8px", minWidth: "200px" }}>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 600 }}>
                    {selectedPub.name}
                  </h3>
                  <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#666", lineHeight: "1.4" }}>
                    {selectedPub.address}
                  </p>
                  {selectedPub.rating > 0 && (
                    <div style={{ fontSize: "12px", color: "#999", marginBottom: "8px" }}>
                      ⭐ {selectedPub.rating.toFixed(1)} ({selectedPub.reviews} reviews)
                    </div>
                  )}
                  <div style={{ fontSize: "12px", display: "flex", gap: "12px", marginTop: "8px" }}>
                    <a
                      href={selectedPub.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#000", textDecoration: "underline" }}
                    >
                      Maps
                    </a>
                    {selectedPub.website && (
                      <a
                        href={selectedPub.website}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#000", textDecoration: "underline" }}
                      >
                        Website
                      </a>
                    )}
                  </div>
                </div>
              </Popup>
            )}
          </Map>
        </div>
      </div>
    </main>
  );
}
