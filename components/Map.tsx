"use client";

import { useMemo, useRef, useState } from "react";
import MapGL, { Layer, LayerProps, MapLayerMouseEvent, MapRef, Popup, Source } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import MarkerPopup from "@/components/MarkerPopup";
import { EcosystemPoint, OfficeListing } from "@/lib/types";
import { toGeoJson } from "@/lib/mapUtils";

interface MapProps {
  listings: OfficeListing[];
  ecosystemPoints: EcosystemPoint[];
  showVcOverlay: boolean;
  showTechOverlay: boolean;
}

const clusterLayer: LayerProps = {
  id: "clusters",
  type: "circle",
  source: "offices",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": "#17253e",
    "circle-radius": ["step", ["get", "point_count"], 16, 10, 22, 25, 28],
    "circle-stroke-width": 2,
    "circle-stroke-color": "#8cb6ff"
  }
};

const clusterCountLayer: LayerProps = {
  id: "cluster-count",
  type: "symbol",
  source: "offices",
  filter: ["has", "point_count"],
  layout: {
    "text-field": ["get", "point_count_abbreviated"],
    "text-size": 12
  },
  paint: {
    "text-color": "#e6eeff"
  }
};

const unclusteredPointLayer: LayerProps = {
  id: "unclustered-point",
  type: "circle",
  source: "offices",
  filter: ["!", ["has", "point_count"]],
  paint: {
    "circle-color": [
      "match",
      ["get", "price_tier"],
      0,
      "#20c55e",
      1,
      "#f59e0b",
      "#ef4444"
    ],
    "circle-radius": [
      "interpolate",
      ["linear"],
      ["get", "desk_count"],
      1,
      6,
      10,
      10,
      20,
      14,
      30,
      18
    ],
    "circle-stroke-width": 1,
    "circle-stroke-color": "#0a0d12"
  }
};

const vcLayer: LayerProps = {
  id: "vc-points",
  type: "circle",
  source: "ecosystem",
  filter: ["==", ["get", "type"], "vc"],
  paint: {
    "circle-color": "#4c8dff",
    "circle-radius": 6,
    "circle-stroke-width": 1,
    "circle-stroke-color": "#0a0d12"
  }
};

const techLayer: LayerProps = {
  id: "tech-points",
  type: "circle",
  source: "ecosystem",
  filter: ["==", ["get", "type"], "tech"],
  paint: {
    "circle-color": "#d946ef",
    "circle-radius": 6,
    "circle-stroke-width": 1,
    "circle-stroke-color": "#0a0d12"
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
    "text-color": "#dce5ff"
  }
};

export default function Map({ listings, ecosystemPoints, showVcOverlay, showTechOverlay }: MapProps) {
  const mapRef = useRef<MapRef | null>(null);
  const [popupListingId, setPopupListingId] = useState<string | null>(null);
  const [popupEcosystemId, setPopupEcosystemId] = useState<string | null>(null);

  const officeGeoJson = useMemo(() => toGeoJson(listings), [listings]);

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

  const popupListing = popupListingId ? listings.find((listing) => listing.id === popupListingId) : null;
  const popupEcosystem = popupEcosystemId ? ecosystemPoints.find((point) => point.id === popupEcosystemId) : null;

  const onMapClick = (event: MapLayerMouseEvent) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const features = map.queryRenderedFeatures(event.point, {
      layers: ["clusters", "unclustered-point", "vc-points", "tech-points"]
    });

    if (!features.length) {
      setPopupListingId(null);
      setPopupEcosystemId(null);
      return;
    }

    const feature = features[0];

    if (feature.layer.id === "clusters") {
      const clusterId = Number(feature.properties?.cluster_id);
      const source = map.getSource("offices") as unknown as {
        getClusterExpansionZoom: (id: number, cb: (error: Error | null, zoom: number) => void) => void;
      };

      if (Number.isFinite(clusterId) && source?.getClusterExpansionZoom) {
        source.getClusterExpansionZoom(clusterId, (error, zoom) => {
          if (error) return;
          const geometry = feature.geometry;
          if (geometry.type !== "Point") return;
          map.easeTo({ center: geometry.coordinates as [number, number], zoom });
        });
      }
      return;
    }

    const id = feature.properties?.id;
    if (typeof id !== "string") return;

    if (feature.layer.id === "unclustered-point") {
      setPopupEcosystemId(null);
      setPopupListingId(id);
      return;
    }

    setPopupListingId(null);
    setPopupEcosystemId(id);
  };

  return (
    <div className="map-wrap">
      <MapGL
        ref={mapRef}
        initialViewState={{
          longitude: -0.0815,
          latitude: 51.5218,
          zoom: 12.8
        }}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        interactiveLayerIds={["clusters", "unclustered-point", "vc-points", "tech-points"]}
        onClick={onMapClick}
      >
        <Source id="offices" type="geojson" data={officeGeoJson} cluster clusterRadius={45} clusterMaxZoom={14}>
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>

        {showVcOverlay || showTechOverlay ? (
          <Source id="ecosystem" type="geojson" data={ecosystemGeoJson}>
            {showVcOverlay ? <Layer {...vcLayer} /> : null}
            {showTechOverlay ? <Layer {...techLayer} /> : null}
            <Layer {...ecosystemLabelLayer} />
          </Source>
        ) : null}

        {popupListing ? (
          <Popup
            longitude={popupListing.longitude}
            latitude={popupListing.latitude}
            closeButton
            closeOnClick={false}
            onClose={() => setPopupListingId(null)}
            maxWidth="320px"
          >
            <MarkerPopup listing={popupListing} />
          </Popup>
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
