// Generate a dense grid of search points across London
// This creates search points every ~1km to ensure comprehensive coverage

const fs = require('fs');

// London boundaries (approximate M25 coverage)
const BOUNDS = {
  north: 51.65,
  south: 51.35,
  east: 0.15,
  west: -0.48
};

// Grid spacing in degrees (roughly 1km = 0.01 degrees)
const GRID_SPACING = 0.015; // ~1.5km between points

function generateGrid() {
  const points = [];
  let id = 0;

  for (let lat = BOUNDS.south; lat <= BOUNDS.north; lat += GRID_SPACING) {
    for (let lng = BOUNDS.west; lng <= BOUNDS.east; lng += GRID_SPACING) {
      points.push({
        lat: parseFloat(lat.toFixed(4)),
        lng: parseFloat(lng.toFixed(4)),
        name: `Grid_${id++}`
      });
    }
  }

  return points;
}

const gridPoints = generateGrid();

console.log(`Generated ${gridPoints.length} search points`);
console.log(`Coverage: ${BOUNDS.north - BOUNDS.south}° lat x ${BOUNDS.east - BOUNDS.west}° lng`);
console.log(`Grid spacing: ${GRID_SPACING}° (~1.5km)`);

// Write to file as JS array literal
const output = `// Auto-generated dense grid covering all of London
// ${gridPoints.length} search points with ~1.5km spacing

const searchPoints = ${JSON.stringify(gridPoints, null, 2)};

module.exports = searchPoints;
`;

fs.writeFileSync('scripts/search-grid.js', output);
console.log('✅ Saved to scripts/search-grid.js');
