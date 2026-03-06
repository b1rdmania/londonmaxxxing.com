"use client";

import { useMemo, useRef, useState } from "react";
import MapGL, { Layer, LayerProps, MapLayerMouseEvent, MapRef, Popup, Source } from "react-map-gl/maplibre";

import { ECOSYSTEM_META } from "@/lib/ecosystemConfig";
import { EcosystemPoint, EcosystemType } from "@/lib/types";

interface MapProps {
  ecosystemPoints: EcosystemPoint[];
  enabledTypes: EcosystemType[];
  darkMode?: boolean;
}

function labelLayer(type: EcosystemType): LayerProps {
  return {
    id: `ecosystem-label-${type}`,
    type: "symbol",
    source: "ecosystem",
    filter: ["==", ["get", "type"], type],
    layout: {
      "text-field": ["get", "name"],
      "text-size": 10,
      "text-offset": [0, 1.1],
      "text-anchor": "top"
    },
    paint: {
      "text-color": "#1f1f1f"
    }
  };
}

function layerId(type: EcosystemType): string {
  return `ecosystem-${type}`;
}

function categoryLayer(type: EcosystemType): LayerProps {
  const meta = ECOSYSTEM_META[type];
  return {
    id: layerId(type),
    type: "circle",
    source: "ecosystem",
    filter: ["==", ["get", "type"], type],
    paint: {
      "circle-color": meta.color,
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        10, 8,  // At zoom 10 (zoomed out), radius 8
        14, 10  // At zoom 14 (zoomed in), radius 10
      ],
      "circle-stroke-width": 1,
      "circle-stroke-color": "#ffffff"
    }
  };
}

export default function Map({ ecosystemPoints, enabledTypes, darkMode = false }: MapProps) {
  const mapRef = useRef<MapRef | null>(null);
  const [popupEcosystemId, setPopupEcosystemId] = useState<string | null>(null);
  const interactiveLayerIds = enabledTypes.map(layerId);

  const ecosystemGeoJson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: ecosystemPoints.map((point) => ({
        type: "Feature" as const,
        properties: {
          id: point.id,
          name: point.name,
          address: point.address,
          type: point.type,
          source_url: point.source_url,
          website: point.website,
          twitter: point.twitter
        },
        geometry: {
          type: "Point" as const,
          coordinates: [point.longitude, point.latitude]
        }
      }))
    }),
    [ecosystemPoints]
  );

  const popupEcosystem = popupEcosystemId ? ecosystemPoints.find((point) => point.id === popupEcosystemId) : null;

  const onMapClick = (event: MapLayerMouseEvent) => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    if (!interactiveLayerIds.length) {
      setPopupEcosystemId(null);
      return;
    }

    // Larger tap target on mobile - query 20px radius around tap point
    const isMobile = window.innerWidth <= 768;
    const buffer = isMobile ? 20 : 5;

    const features = map.queryRenderedFeatures(
      [
        [event.point.x - buffer, event.point.y - buffer],
        [event.point.x + buffer, event.point.y + buffer]
      ],
      {
        layers: interactiveLayerIds
      }
    );

    if (!features.length) {
      setPopupEcosystemId(null);
      return;
    }

    const id = features[0].properties?.id;
    if (typeof id !== "string") return;
    setPopupEcosystemId(id);
  };

  return (
    <div className="map-wrap">
      <MapGL
        ref={mapRef}
        style={{ width: "100%", height: "100%" }}
        initialViewState={{
          longitude: -0.098,
          latitude: 51.515,
          zoom: 11.2
        }}
        mapStyle={darkMode ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"}
        interactiveLayerIds={interactiveLayerIds}
        onClick={onMapClick}
        dragRotate={false}
        touchPitch={false}
        attributionControl={{
          compact: false,
          customAttribution: '<a href="https://x.com/b1rdmania" target="_blank" rel="noreferrer">Built by Birdmania</a>'
        }}
      >
        {enabledTypes.length ? (
          <Source id="ecosystem" type="geojson" data={ecosystemGeoJson}>
            {enabledTypes.map((type) => (
              <Layer key={type} {...categoryLayer(type)} />
            ))}
            {enabledTypes.map((type) => (
              <Layer key={`label-${type}`} {...labelLayer(type)} />
            ))}
          </Source>
        ) : null}

        {popupEcosystem ? (
          <Popup
            longitude={popupEcosystem.longitude}
            latitude={popupEcosystem.latitude}
            closeButton
            closeOnClick={false}
            onClose={() => setPopupEcosystemId(null)}
            maxWidth="320px"
          >
            <div className="popup-card">
              <h3>{popupEcosystem.name}</h3>
              <div className="popup-meta-row">
                <span
                  className="popup-badge"
                  style={{
                    borderColor: ECOSYSTEM_META[popupEcosystem.type].color,
                    color: ECOSYSTEM_META[popupEcosystem.type].color
                  }}
                >
                  {ECOSYSTEM_META[popupEcosystem.type].label.toUpperCase()}
                </span>
              </div>
              {popupEcosystem.notes ? <p className="popup-description">{popupEcosystem.notes}</p> : null}
              <p className="popup-address">{popupEcosystem.address}</p>
              <div className="popup-actions">
                {popupEcosystem.website ? (
                  <a className="popup-btn" href={popupEcosystem.website} target="_blank" rel="noreferrer">
                    Website
                  </a>
                ) : null}
                {popupEcosystem.twitter ? (
                  <a className="popup-btn" href={`https://x.com/${popupEcosystem.twitter.replace('@', '')}`} target="_blank" rel="noreferrer">
                    X
                  </a>
                ) : null}
              </div>
            </div>
          </Popup>
        ) : null}
      </MapGL>
    </div>
  );
}
