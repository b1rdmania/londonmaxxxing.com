"use client";

import { useMemo, useRef, useState } from "react";
import MapGL, { Layer, LayerProps, MapLayerMouseEvent, MapRef, Popup, Source } from "react-map-gl/maplibre";

import { EcosystemPoint } from "@/lib/types";

interface MapProps {
  ecosystemPoints: EcosystemPoint[];
  showVcOverlay: boolean;
  showTechOverlay: boolean;
}

const vcLayer: LayerProps = {
  id: "vc-points",
  type: "circle",
  source: "ecosystem",
  filter: ["==", ["get", "type"], "vc"],
  paint: {
    "circle-color": "#2f62ff",
    "circle-radius": 6,
    "circle-stroke-width": 1,
    "circle-stroke-color": "#ffffff"
  }
};

const techLayer: LayerProps = {
  id: "tech-points",
  type: "circle",
  source: "ecosystem",
  filter: ["==", ["get", "type"], "tech"],
  paint: {
    "circle-color": "#ff7b22",
    "circle-radius": 6,
    "circle-stroke-width": 1,
    "circle-stroke-color": "#ffffff"
  }
};

const ecosystemLabelLayer: LayerProps = {
  id: "ecosystem-labels",
  type: "symbol",
  source: "ecosystem",
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

export default function Map({ ecosystemPoints, showVcOverlay, showTechOverlay }: MapProps) {
  const mapRef = useRef<MapRef | null>(null);
  const [popupEcosystemId, setPopupEcosystemId] = useState<string | null>(null);
  const interactiveLayerIds = [
    ...(showVcOverlay ? ["vc-points"] : []),
    ...(showTechOverlay ? ["tech-points"] : [])
  ];

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
          source_url: point.source_url
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

    const features = map.queryRenderedFeatures(event.point, {
      layers: interactiveLayerIds
    });

    if (!features.length) {
      setPopupEcosystemId(null);
      return;
    }

    const feature = features[0];

    const id = feature.properties?.id;
    if (typeof id !== "string") return;
    setPopupEcosystemId(id);
  };

  return (
    <div className="map-wrap">
      <MapGL
        ref={mapRef}
        style={{ width: "100%", height: "100%" }}
        initialViewState={{
          longitude: -0.0815,
          latitude: 51.5218,
          zoom: 12.8
        }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        interactiveLayerIds={interactiveLayerIds}
        onClick={onMapClick}
      >
        {showVcOverlay || showTechOverlay ? (
          <Source id="ecosystem" type="geojson" data={ecosystemGeoJson}>
            {showVcOverlay ? <Layer {...vcLayer} /> : null}
            {showTechOverlay ? <Layer {...techLayer} /> : null}
            {(showVcOverlay || showTechOverlay) ? <Layer {...ecosystemLabelLayer} /> : null}
          </Source>
        ) : null}

        {popupEcosystem ? (
          <Popup
            longitude={popupEcosystem.longitude}
            latitude={popupEcosystem.latitude}
            closeButton
            closeOnClick={false}
            onClose={() => setPopupEcosystemId(null)}
            maxWidth="300px"
          >
            <div className="popup-card">
              <h3>{popupEcosystem.name}</h3>
              <p>{popupEcosystem.address}</p>
              <p>
                Type: <strong>{popupEcosystem.type.toUpperCase()}</strong>
              </p>
              <a href={popupEcosystem.source_url} target="_blank" rel="noreferrer">
                Source
              </a>
            </div>
          </Popup>
        ) : null}
      </MapGL>
    </div>
  );
}
