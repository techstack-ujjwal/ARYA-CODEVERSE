# JuryX Enterprise Design System Specification (v2.0)

## 1. Design Vision & Philosophy
JuryX is built for high-stakes, evidence-grounded hackathon evaluation. The UI combines the precision and density of developer terminal telemetry with the refined elegance of modern enterprise platforms (inspired by Linear, Vercel, Apple, and Raycast).

### Core Visual Tenets:
1. **Atmospheric Depth & Specular Lighting**: Every card and container features a subtle 1px top specular gradient edge (`before:bg-gradient-to-r before:from-transparent before:via-white/12 before:to-transparent`), frosted glass backdrop blur, and multi-layer drop shadows (`shadow-2xl shadow-black/60`).
2. **Deterministic Information Density**: Clear visual separation of claims, tool telemetry, score breakdown meters, and qualitative feedback.
3. **Harmonic Color System**: High-contrast, dark-mode-first color palette using deep zinc neutral tones accented by vibrant semantic neons (Indigo, Emerald, Amber, Cyan, Rose).
4. **Fluid Micro-Interactions**: Smooth 150ms-200ms cubic-bezier transitions for hover states, scale lifts, and interactive toggle switches.

---

## 2. Color Palette & Tokens

| Token | Hex / HSL | Usage |
| :--- | :--- | :--- |
| **Canvas Background** | `#09090b` (`zinc-950`) | Root body background, base viewport canvas |
| **Surface Dark (Level 1)** | `rgba(18, 18, 22, 0.75)` | Cards, sidebars, header navigation surfaces |
| **Surface Elevated (Level 2)** | `rgba(24, 24, 28, 0.85)` | Popovers, modals, dropdown menus, hover cards |
| **Surface Slot (Level 3)** | `rgba(10, 10, 14, 0.60)` | Rubric slots, score boxes, code evidence blocks |
| **Border Subtle** | `rgba(255, 255, 255, 0.08)` (`zinc-800/80`) | Primary container borders |
| **Border Active / Focus** | `rgba(99, 102, 241, 0.50)` | Active tab, focus ring, elevated border |
| **Accent Indigo** | `#6366f1` / `#818cf8` | AI agents, synthesis, primary action glow |
| **Accent Emerald** | `#10b981` / `#34d399` | Verification status, health pulse, live uptime |
| **Accent Amber** | `#f59e0b` / `#fbbf24` | Human judge scoring, final leaderboard trophy |
| **Accent Sky/Cyan** | `#0ea5e9` / `#38bdf8` | Diagnostic telemetry, fast turnaround indicators |
| **Accent Rose** | `#f43f5e` / `#fb7185` | Anti-cheating flags, vulnerability warnings, errors |

---

## 3. Typography Hierarchy & Micro-Copy Standards

- **Display Headings**: Font Sans, bold to black weight (`font-black tracking-tight`), gradient clips (`bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-500`).
- **Body & Captions**: Clean neutral zinc (`text-zinc-300` / `text-zinc-400`), high legibility, optimized line heights (`leading-relaxed`).
- **Telemetry & Numbers**: Geist Mono / JetBrains Mono (`font-mono`), tabular numeric alignment (`tabular-nums`), uppercase tracking for labels (`tracking-wider text-[10px] uppercase font-semibold`).

---

## 4. Component Design Patterns

### A. Specular Glass Cards (`Card.tsx`)
```html
<div class="relative rounded-2xl p-5 bg-zinc-900/70 backdrop-blur-xl border border-zinc-800/80 shadow-xl shadow-black/40 overflow-hidden
            before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent">
  <!-- Card Content -->
</div>
```

### B. Segmented Controls & Interactive Toggles (`Toggle.tsx`)
- Tactile spring transition with glow halos.
- Distinct states for inactive (`bg-zinc-900 border-zinc-800 text-zinc-400`) and active (`bg-zinc-800 text-zinc-100 border-zinc-700/80 shadow-sm`).

### C. Glowing Buttons & Action Triggers (`Button.tsx`)
- Primary button: Ultra-clean white slate (`bg-zinc-100 text-zinc-950 font-semibold hover:bg-white active:scale-[0.98] shadow-md shadow-white/5`).
- Secondary button: Dark glass (`bg-zinc-900/80 text-zinc-200 border border-zinc-800 hover:bg-zinc-800/80 hover:border-zinc-700`).

---

## 5. Layout & Atmospheric Enhancements
- **Mesh Radial Gradients**: Dynamic subtle ambient spotlights (`bg-radial-gradient`) in hero sections and background canvas.
- **Micro Grid Pattern**: Crisp 24px subtle dot matrix background (`bg-grid-pattern`).
- **Noise / Grain Overlay**: Optional soft texture layer for cinematic depth.
