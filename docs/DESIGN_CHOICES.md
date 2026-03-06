# Londonmaxxxing Design Choices (DigOS Mode)

## Core Direction
- Bare-bones, high-signal interface.
- Treat UI like a terminal dashboard, not a startup marketing site.
- Typography and linework do most of the work, not gradients or animation.

## Visual Rules
- Palette: grayscale first (`#f0f0f0`, `#d8d8d8`, `#222`, `#000`).
- Borders: 1px solid, square corners, visible separators.
- Shadows: avoid soft glows; use either no shadow or very hard inset shadows.
- Motion: no decorative animation by default.

## Typography
- Brand/headline: serif (Georgia/Times).
- Controls/meta/data: monospace (`Courier New` or equivalent).
- Case: uppercase for system controls and labels.

## Layout
- Persistent top nav as control rail.
- Main viewport reserved for map.
- Do not place floating cards unless they are critical for interaction.

## Layer Strategy
- Default on: `VC`, `TECH`.
- Deferred layer (week two): `OFFICE`.
- Office is optional and secondary to ecosystem context.

## Map Styling
- Prefer light grayscale basemap for this mode.
- Keep point colors restrained:
  - VC: black
  - Tech: dark gray
  - Office: muted neutral ramp
- Labels minimal and utilitarian.

## Component Patterns
- Buttons: OS-style hard controls (bordered, rectangular, compact).
- Popups: hard border, monospace text, no rounded corners.
- Status text: small, low-contrast metadata in top rail.

## Content Tone
- Functional and direct.
- No corporate fluff, no marketing-heavy copy.
- Emphasize mapping utility and legibility.

## Future Pages
When designing new pages in this repo:
1. Start with wireframe-level hierarchy before decoration.
2. Use border rhythm (section dividers) before introducing color.
3. Keep one primary action per surface.
4. Reuse top rail control pattern for global state.
