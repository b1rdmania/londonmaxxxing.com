"use client";

import { useMemo, useRef, useState } from "react";
import MapGL, { Layer, LayerProps, MapLayerMouseEvent, MapRef, Popup, Source } from "react-map-gl/maplibre";

import MarkerPopup from "@/components/MarkerPopup";
import { EcosystemPoint, OfficeListing } from "@/lib/types";
import { toGeoJson } from "@/lib/mapUtils";

interface MapProps {
  listings: OfficeListing[];
  ecosystemPoints: EcosystemPoint[];
  showOfficeLayer: boolean;
  showVcOverlay: boolean;
  showTechOverlay: boolean;
}

const clusterLayer: LayerProps = {
  id: "clusters",
  type: "circle",
  source: "offices",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": "#a9a9a9",
    "circle-radius": ["step", ["get", "point_count"], 16, 10, 22, 25, 28],
    "circle-stroke-width": 2,
    "circle-stroke-color": "#2a2a2a"
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
    "text-color": "#111111"
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
      "#b0b0b0",
      1,
      "#888888",
      "#575757"
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
    "circle-stroke-color": "#111111"
  }
};

const vcLayer: LayerProps = {
  id: "vc-points",
  type: "circle",
  source: "ecosystem",
  filter: ["==", ["get", "type"], "vc"],
  paint: {
    "circle-color": "#050505",
    "circle-radius": 6,
    "circle-stroke-width": 1,
    "circle-stroke-color": "#f2f2f2"
  }
};

const techLayer: LayerProps = {
  id: "tech-points",
  type: "circle",
  source: "ecosystem",
  filter: ["==", ["get", "type"], "tech"],
  paint: {
    "circle-color": "#4a4a4a",
    "circle-radius": 6,
    "circle-stroke-width": 1,
    "circle-stroke-color": "#f2f2f2"
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

export default function Map({ listings, ecosystemPoints, showOfficeLayer, showVcOverlay, showTechOverlay }: MapProps) {
  const mapRef = useRef<MapRef | null>(null);
  const [popupListingId, setPopupListingId] = useState<string | null>(null);
  const [popupEcosystemId, setPopupEcosystemId] = useState<string | null>(null);
  const interactiveLayerIds = [
    ...(showOfficeLayer ? ["clusters", "unclustered-point"] : []),
    ...(showVcOverlay ? ["vc-points"] : []),
    ...(showTechOverlay ? ["tech-points"] : [])
  ];

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
    if (!interactiveLayerIds.length) {
      setPopupListingId(null);
      setPopupEcosystemId(null);
      return;
    }

    const features = map.queryRenderedFeatures(event.point, {
      layers: interactiveLayerIds
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
        {showOfficeLayer ? (
          <Source id="offices" type="geojson" data={officeGeoJson} cluster clusterRadius={45} clusterMaxZoom={14}>
            <Layer {...clusterLayer} />
            <Layer {...clusterCountLayer} />
            <Layer {...unclusteredPointLayer} />
          </Source>
        ) : null}

        {showVcOverlay || showTechOverlay ? (
          <Source id="ecosystem" type="geojson" data={ecosystemGeoJson}>
            {showVcOverlay ? <Layer {...vcLayer} /> : null}
            {showTechOverlay ? <Layer {...techLayer} /> : null}
            {(showVcOverlay || showTechOverlay) ? <Layer {...ecosystemLabelLayer} /> : null}
          </Source>
        ) : null}

        {popupListing && showOfficeLayer ? (
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
