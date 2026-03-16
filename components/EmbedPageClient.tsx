"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import Map from "@/components/Map";
import { ECOSYSTEM_META, ECOSYSTEM_ORDER } from "@/lib/ecosystemConfig";
import { EcosystemPoint, EcosystemType } from "@/lib/types";

interface EmbedPageClientProps {
  ecosystemPoints: EcosystemPoint[];
}

function buildInitialState(points: EcosystemPoint[]): Record<EcosystemType, boolean> {
  const initial: Record<EcosystemType, boolean> = {
    vc: false,
    ai: false,
    ai_bio: false,
    fintech: false,
    web3: false,
    coworking: false,
    edu: false,
    big_tech: false,
    funding: false
  };

  points.forEach((point) => {
    initial[point.type] = true;
  });

  return initial;
}

const DEFAULT_VISIBLE_TYPES: EcosystemType[] = ["vc", "funding", "ai", "ai_bio", "fintech", "web3", "coworking", "edu", "big_tech"];

export default function EmbedPageClient({ ecosystemPoints }: EmbedPageClientProps) {
  const searchParams = useSearchParams();
  const [legendOpen, setLegendOpen] = useState(false);

  // Parse URL params for filtering
  const categoryParam = searchParams.get("category");
  const categoriesParam = searchParams.get("categories");

  const [enabledByType, setEnabledByType] = useState<Record<EcosystemType, boolean>>(() => {
    const initial = buildInitialState(ecosystemPoints);

    // If specific categories are requested via URL params
    if (categoryParam || categoriesParam) {
      const requestedCategories = categoryParam
        ? [categoryParam as EcosystemType]
        : (categoriesParam?.split(',') as EcosystemType[] || []);

      // Set all to false first
      Object.keys(initial).forEach(key => {
        initial[key as EcosystemType] = false;
      });

      // Enable only requested categories
      requestedCategories.forEach(cat => {
        if (cat in initial) {
          initial[cat as EcosystemType] = true;
        }
      });

      return initial;
    }

    // Default: show all
    const hasAny = Object.values(initial).some(Boolean);
    if (hasAny) return initial;
    return {
      ...initial,
      vc: true,
      ai: true,
      ai_bio: true,
      fintech: true,
      web3: true,
      edu: true,
      big_tech: true
    };
  });

  const availableTypes = useMemo(
    () => {
      const fromData = ECOSYSTEM_ORDER.filter((type) => ecosystemPoints.some((point) => point.type === type));
      return fromData.length ? fromData : DEFAULT_VISIBLE_TYPES;
    },
    [ecosystemPoints]
  );

  const enabledTypes = useMemo(
    () => availableTypes.filter((type) => enabledByType[type]),
    [availableTypes, enabledByType]
  );

  return (
    <main className="shell embed-mode">
      <Map ecosystemPoints={ecosystemPoints} enabledTypes={enabledTypes} />

      {/* Legend toggle */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        zIndex: 10
      }}>
        <button
          onClick={() => setLegendOpen(!legendOpen)}
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: '"Times New Roman", Times, serif',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          Legend
        </button>

        {legendOpen && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '12px',
            marginTop: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            minWidth: '180px'
          }}>
            <div style={{
              fontSize: '11px',
              fontWeight: '600',
              marginBottom: '8px',
              fontFamily: '"Times New Roman", Times, serif',
              color: '#666'
            }}>
              COMPANY TYPES
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              {availableTypes.map((type) => {
                const meta = ECOSYSTEM_META[type];
                return (
                  <div
                    key={type}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      fontFamily: '"Times New Roman", Times, serif'
                    }}
                  >
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: meta.color,
                      border: '1px solid #fff',
                      boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
                      flexShrink: 0
                    }} />
                    <span>{meta.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
