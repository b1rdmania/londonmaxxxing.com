"use client";

import { useState } from "react";
import { ECOSYSTEM_META, ECOSYSTEM_ORDER } from "@/lib/ecosystemConfig";
import { EcosystemPoint, EcosystemType } from "@/lib/types";

interface EmbedCodeGeneratorProps {
  ecosystemPoints: EcosystemPoint[];
}

export default function EmbedCodeGenerator({ ecosystemPoints }: EmbedCodeGeneratorProps) {
  const [selectedCategories, setSelectedCategories] = useState<Set<EcosystemType>>(
    new Set(ECOSYSTEM_ORDER)
  );
  const [copied, setCopied] = useState(false);

  const toggleCategory = (type: EcosystemType) => {
    const newSet = new Set(selectedCategories);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    setSelectedCategories(newSet);
  };

  const generateEmbedCode = () => {
    const baseUrl = "https://londonmaxxxing.com/embed";
    const categories = Array.from(selectedCategories);

    if (categories.length === 0) {
      return `<iframe src="${baseUrl}" width="100%" height="600" frameborder="0"></iframe>`;
    }

    if (categories.length === ECOSYSTEM_ORDER.length) {
      // All selected - no need for params
      return `<iframe src="${baseUrl}" width="100%" height="600" frameborder="0"></iframe>`;
    }

    if (categories.length === 1) {
      return `<iframe src="${baseUrl}?category=${categories[0]}" width="100%" height="600" frameborder="0"></iframe>`;
    }

    const categoriesParam = categories.join(",");
    return `<iframe src="${baseUrl}?categories=${categoriesParam}" width="100%" height="600" frameborder="0"></iframe>`;
  };

  const embedCode = generateEmbedCode();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="embed-generator">
      <div className="embed-generator-container">
        <header className="embed-generator-header">
          <h1>Embed London Tech Heatmap</h1>
          <p>
            Add the interactive map to your website. Select the categories you want to display.
          </p>
        </header>

        <section className="embed-generator-options">
          <h2>Select Categories</h2>
          <div className="category-checkboxes">
            {ECOSYSTEM_ORDER.map((type) => {
              const isSelected = selectedCategories.has(type);
              return (
                <label key={type} className="category-checkbox">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleCategory(type)}
                  />
                  <span
                    className="category-checkbox-indicator"
                    style={{
                      background: isSelected ? ECOSYSTEM_META[type].color : "transparent",
                      borderColor: ECOSYSTEM_META[type].color
                    }}
                  />
                  <span className="category-checkbox-label">{ECOSYSTEM_META[type].label}</span>
                </label>
              );
            })}
          </div>
        </section>

        <section className="embed-generator-preview">
          <h2>Preview</h2>
          <div className="embed-preview-frame">
            <iframe
              src={`/embed${selectedCategories.size === 0 ? "" : selectedCategories.size === 1 ? `?category=${Array.from(selectedCategories)[0]}` : selectedCategories.size === ECOSYSTEM_ORDER.length ? "" : `?categories=${Array.from(selectedCategories).join(",")}`}`}
              width="100%"
              height="400"
              frameBorder="0"
              title="Embed preview"
            />
          </div>
        </section>

        <section className="embed-generator-code">
          <h2>Embed Code</h2>
          <div className="code-block">
            <pre>{embedCode}</pre>
            <button onClick={copyToClipboard} className="copy-btn">
              {copied ? "Copied!" : "Copy Code"}
            </button>
          </div>
          <p className="code-instructions">
            Copy this code and paste it into your website&apos;s HTML where you want the map to appear.
          </p>
        </section>

        <footer className="embed-generator-footer">
          <a href="/" className="back-link">← Back to map</a>
        </footer>
      </div>
    </main>
  );
}
