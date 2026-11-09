---
version: alpha
name: BatCavaDesign
description: "A dark-canvas engineering and campus operations design system anchored in the deepest obsidian void (#08090a / #010102), paired with the official Cebu Technological University monochrome seal, dignified CTU Maroon (#7B1113 / #800000) micro-accent notches, and Google Stitch Home's signature violet/lavender (#a78bfa / #5e6ad2) dynamic luminescence. Features an organic undulating spatial wave canvas with physical pointer repulsion (elastic spring physics), a four-step surface ladder framed by 1px hairline borders (#23252a to #34343a), Geist Pixel display typography, non-stacking floating pill toasts with glowing status dots, and tactile multi-channel auditory feedback."

colors:
  primary: "#5e6ad2"
  primary-light: "#a78bfa"
  primary-hover: "#828fff"
  primary-focus: "#5e69d1"
  primary-tint: "rgba(167, 139, 250, 0.15)"
  brand-ctu: "#7B1113"
  brand-ctu-dark: "#5A0C0E"
  brand-secure: "#7a7fad"
  ink: "#f7f8f8"
  ink-muted: "#d0d6e0"
  ink-subtle: "#8a8f98"
  ink-tertiary: "#62666d"
  canvas: "#08090a"
  canvas-deep: "#010102"
  surface-1: "#0f1011"
  surface-2: "#141516"
  surface-3: "#18191a"
  surface-4: "#191a1b"
  hairline: "#23252a"
  hairline-strong: "#34343a"
  hairline-tertiary: "#3e3e44"
  halftone-dot: "rgba(167, 139, 250, 0.25)"
  halftone-glow: "rgba(196, 181, 253, 0.85)"
  inverse-canvas: "#ffffff"
  inverse-surface-1: "#f5f6f6"
  inverse-surface-2: "#f6f7f7"
  inverse-ink: "#0a0a0a"
  semantic-success: "#27a644"
  semantic-warning: "#f59e0b"
  semantic-error: "#ef4444"
  semantic-info: "#6366f1"
  semantic-overlay: "rgba(0, 0, 0, 0.85)"

typography:
  display-pixel:
    fontFamily: Geist Pixel, monospace
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: -0.5px
  display-xl:
    fontFamily: Geist, -apple-system, system-ui
    fontSize: 80px
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -3.0px
  display-lg:
    fontFamily: Geist, -apple-system, system-ui
    fontSize: 56px
    fontWeight: 600
    lineHeight: 1.10
    letterSpacing: -1.8px
  display-md:
    fontFamily: Geist, -apple-system, system-ui
    fontSize: 40px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -1.0px
  headline:
    fontFamily: Geist, -apple-system, system-ui
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.20
    letterSpacing: -0.6px
  card-title:
    fontFamily: Geist, -apple-system, system-ui
    fontSize: 22px
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: -0.4px
  subhead:
    fontFamily: Geist, -apple-system, system-ui
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.40
    letterSpacing: -0.2px
  body-lg:
    fontFamily: Geist, -apple-system, system-ui
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: -0.1px
  body:
    fontFamily: Geist, -apple-system, system-ui
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: -0.05px
  body-sm:
    fontFamily: Geist, -apple-system, system-ui
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0
  caption:
    fontFamily: Geist, -apple-system, system-ui
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.40
    letterSpacing: 0
  button:
    fontFamily: Geist Pixel, monospace
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.20
    letterSpacing: 0.5px
  eyebrow:
    fontFamily: Geist Mono, monospace
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1.30
    letterSpacing: 0.6px
    textTransform: uppercase
  mono:
    fontFamily: Geist Mono, JetBrains Mono, monospace
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0

rounded:
  none: 0px
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  xxl: 24px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  grid: 30px
  section: 96px

components:
  button-primary:
    backgroundColor: "{colors.canvas-deep}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline-strong}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: 10px 20px
    sound: "apple-pay"
  button-sample:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink-subtle}"
    typography: "{typography.eyebrow}"
    rounded: "{rounded.xs}"
    sound: "scribblenauts"
  button-outage:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.eyebrow}"
    rounded: "{rounded.pill}"
    sound: "switch-notification"
  select-custom:
    backgroundColor: "{colors.surface-1}"
    border: "1px solid {colors.hairline}"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    hoverSound: "typewriter"
    selectSound: "click-pen"
  toast-pill:
    backgroundColor: "{colors.surface-2}"
    border: "1px solid {colors.hairline-strong}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    elevation: "0 8px 32px rgba(0, 0, 0, 0.6)"
  ticket-card:
    backgroundColor: "{colors.surface-1}"
    border: "1px solid {colors.hairline}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 20px
    hoverBorder: "{colors.hairline-strong}"
    hoverSound: "typewriter"
  canvas-background:
    engine: "HTML5 Canvas (Google Stitch Home Wave Physics)"
    spacing: "{spacing.grid}"
    baseDotColor: "{colors.halftone-dot}"
    illuminatedDotColor: "{colors.halftone-glow}"
    mouseRepulsionRadius: 160
    waveSpeed: 0.024
---

# BatCava Design System (`BatCavaDesign.md`)

> **Architectural Specification & Visual Design Language**  
> *Developed for High-Stakes Institutional Operations, Modern AI-Native Software Craft, and Cebu Technological University Digital Ecosystems.*

---

## 1. Executive Philosophy & Brand DNA

The **BatCava Design System** is an engineering-first, high-signal design framework born at the intersection of three rigorous design philosophies:

1. **Google Stitch AI Canvas (`stitch.google.com/home`):** An organic, living digital workspace featuring harmonic undulating mathematical wave motion, physical cursor repulsion ripples, and radiant violet/lavender (`#a78bfa`) luminescence.
2. **Bryl Lim & Linear Minimalism (`bryllim.com` / `linear.app`):** An uncompromising rejection of skeuomorphic gloss, excessive blur, and decorative clutter. Hierarchy is governed through disciplined 4-tier surface stacking, crisp 1px hairline borders (`#23252a`), and negative typographic tracking.
3. **Official Cebu Technological University Identity:** Grounded by the dignified CTU monochrome circular university seal (Est. 1911), paired with measured CTU Maroon (`#7B1113`) micro-accent corner notches for institutional authority without visual noise.

```
       [ Deep Obsidian Canvas: #08090a / #010102 ]
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
[ Google Stitch Home ]                 [ Bryl Lim / Linear ]
• Undulating Sine Wave                 • 4-Tier Surface Ladder
• 160px Cursor Ripple                  • 1px Hairline Borders
• #a78bfa Violet Glow                  • Non-stacking Pills
       │                                       │
       └───────────────────┬───────────────────┘
                           ▼
          [ CTU Institutional Monochrome ]
          • Official 1911 Circular Seal
          • #7B1113 Maroon Accent Notch
          • Tactile Multichannel Audio
```

---

## 2. Color Architecture & Spatial Tokens

### 2.1 The Obsidian Canvas Void
The ground plane is not flat gray; it is an immersive, near-black obsidian canvas (`#08090a` / `#010102`) that creates maximum contrast for floating UI panels, telemetry feeds, and interactive canvas dots.

```
Canvas Base:        #08090a  (Root body void)
Canvas Deep:        #010102  (Pure black anchor)
Surface Elevation 1: #0f1011 (Card & intake panels)
Surface Elevation 2: #141516 (Interactive inputs, modals, toasts)
Surface Elevation 3: #18191a (Hovered micro-containers, active chips)
Surface Elevation 4: #191a1b (Deepest lifted tool trays)
```

### 2.2 Hairline Structural Boundaries
Surfaces never rely on soft atmospheric drop shadows to express depth. Depth is defined strictly by razor-sharp 1px hairline borders:
- **Hairline Default (`#23252a`):** Standard structural separation for resting cards, tables, and top navigation.
- **Hairline Strong (`#34343a`):** Interactive hover states, active input borders, and toast pill boundaries.
- **Hairline Tertiary (`#3e3e44`):** Subdued inner dividers and nested micro-containers.

### 2.3 Chromatic Accent Hierarchy
1. **Stitch Violet / Lavender (`#a78bfa` / `#5e6ad2`):** Primary interactive focus rings, active canvas point excitation, and key CTA highlights.
2. **CTU Maroon (`#7B1113` / `#800000`):** Dignified 45-degree corner accent notches and institutional verification stamps.
3. **Semantic Status Spectrum:**
   - **Pending (`#f59e0b` / Amber):** 6px ambient glowing status dot (`rgba(245, 158, 11, 0.4)` bloom).
   - **In Progress (`#6366f1` / Indigo):** 6px ambient glowing status dot (`rgba(99, 102, 241, 0.4)` bloom).
   - **Resolved (`#27a644` / Emerald):** 6px ambient glowing status dot (`rgba(39, 166, 68, 0.4)` bloom).

---

## 3. Interactive Halftone Canvas Engine (Google Stitch Home Physics)

The hallmark feature of the BatCava system is the living canvas backdrop (`interactiveHalftone.js`), engineered according to the exact mathematical physics of `stitch.google.com/home`:

### 3.1 Undulating Spatial Wave Math
Rather than static dots or linear noise, every point on the 30px grid undulates smoothly in two spatial dimensions:
$$\text{waveX} = \sin(\text{time} + \text{originY} \times 0.012) \times 4.5\text{px}$$
$$\text{waveY} = \cos(\text{time} + \text{originX} \times 0.012) \times 4.5\text{px}$$

A secondary wave shimmer modulates baseline luminescence:
$$\alpha_{\text{shimmer}} = \sin(\text{time} \times 1.4 + \text{originX} \times 0.018) \times 0.08$$

### 3.2 Elastic Cursor Repulsion & Ripple Indentation
When the pointer enters the viewport, dots within a **160px interaction radius** are dynamically pushed away along their angle of incidence, mimicking a finger depressing an elastic rubber membrane:
$$\Delta X = -\cos(\theta) \times \text{force} \times 28\text{px},\quad \Delta Y = -\sin(\theta) \times \text{force} \times 28\text{px}$$
$$\text{where } \text{force} = 1 - \frac{\text{distance}}{\text{radius}}$$

### 3.3 Spring Damping & Return Physics
Points do not snap abruptly. Their actual render position smoothly interpolates towards the target using exponential spring damping (`0.12` lerp factor):
$$\text{dot.x} \mathrel{+}= (\text{targetX} - \text{dot.x}) \times 0.12$$
$$\text{dot.y} \mathrel{+}= (\text{targetY} - \text{dot.y}) \times 0.12$$

### 3.4 Dynamic Proximity Luminance
- **Resting Dot:** $1.35\text{px}$ radius, $\alpha = 0.22 \sim 0.30$, rendered in Stitch Violet (`rgba(167, 139, 250, alpha)`).
- **Peak Cursor Indentation:** Scales up to $2.85\text{px}$ radius, $\alpha = 0.85$, shifting into pearlescent illuminated lavender (`rgba(196, 181, 253, alpha)`).

---

## 4. Typography & Font Stacks

The system employs a strict tripartite typographical hierarchy:

| Role | Font Family | Characteristics | Example Applications |
| :--- | :--- | :--- | :--- |
| **Pixel Display** | `Geist Pixel`, monospace | Crisp, retro-futuristic pixel-rendered geometry | Primary CTA button text, university brand header |
| **Interface Sans** | `Geist`, `-apple-system`, `system-ui` | Engineered neutrality, negative tracking at scale | Section titles, input forms, body text, cards |
| **Technical Mono** | `Geist Mono`, `JetBrains Mono` | Tabular numeric alignment, character-invariant | Ticket IDs (`#REQ-YYYYMMDD-XXXX`), counters, timestamps |

---

## 5. Component System & Signature Patterns

### 5.1 Primary Submit Button (`btn-submit-request`)
- **Geometry:** Full-width rounded-full pill (`rounded: 9999px`) with zero icon clutter (plus icon removed per design mandate).
- **Typography:** Set strictly in `Geist Pixel` (`font-family: var(--font-pixel)`), uppercase tracking.
- **Surface:** Deep charcoal gradient with 1px hairline border `#34343a`.
- **Sound:** Apple Pay confirmation chime on click.

### 5.2 Bryl Lim Custom Category Select
- **Trigger:** Sleek rounded rectangle (`rounded-md`, 8px) with hairline border and miniature chevron.
- **Options Menu:** Rendered as a floating card with explicit display toggles (`display: none` / `display: flex`).
- **Interactive Feedback:**
  - `pointerenter` on option: Mechanical typewriter click sound.
  - `click` to select: Ballpoint pen click feedback sound.

### 5.3 Floating Pill Toasts (Strict Single-Toast Presentation)
- **Geometry:** Rounded-full pill (`px-4 py-2 rounded-full`) centered at the top-right viewport.
- **Ambient Dot:** 6px glowing indicator dot with radial pulse box-shadow.
- **Stacking Policy:** Strictly **single-toast** presentation. New toasts atomically replace prior toasts with instant DOM de-duplication; toasts never accumulate into multi-card towers.

### 5.4 Multichannel Auditory Feedback Map
Auditory cues provide instant tactile confirmation for keyboard and mouse interactions:

```
┌─────────────────────────────────┬────────────────────────────────────┐
│ User Action                     │ Audio Feedback Asset               │
├─────────────────────────────────┼────────────────────────────────────┤
│ Submit Ticket / Sound Toggle    │ Apple Pay Confirmation Chime       │
│ Auto-Fill Sample Ticket Click   │ Scribblenauts Key Press            │
│ 503 Server Outage Toggle        │ Nintendo Switch Notification Sound │
│ Dropdown Trigger / Filter Click │ Retractable Ballpoint Pen Click    │
│ Card Hover / Choice Hover       │ Mechanical Typewriter Tick         │
│ General Utility Click           │ Minecraft Wooden Click             │
└─────────────────────────────────┴────────────────────────────────────┘
```

---

## 6. Official Institutional Branding Guidelines

### 6.1 The CTU Seal
- **Asset Paths:**
  - Favicon: `favicon.ico` (32×32 root icon)
  - Tab Icon: `assets/icons/favicon-32x32.png` & `favicon.png` (64×64)
  - iOS Home Screen: `assets/icons/apple-touch-icon.png` (180×180)
  - PWA Manifest: `assets/icons/icon-192.png` & `icon-512.png`
- **Treatment:** 100% transparent PNG circular seal centered on the 1911 university crest. Rendered in clean monochrome grayscale to integrate harmoniously with the BatCava dark void without color clashing.

### 6.2 The Maroon Notch Accent
- Located on key structural anchor containers (e.g., top-left brand block).
- Cut as a $45^\circ$ rotated square notch in `#7B1113`, providing an indelible institutional signature.

---

## 7. Performance & Offline SLA Standards

1. **Service Worker Caching:** Implements Cache-First caching strategy (`ctu-smartdesk-v21`) for instant, sub-50ms offline reloads.
2. **60 FPS Canvas Budget:** Zero allocation during animation loops; all particle objects pre-instantiated in memory.
3. **Tab Sleep Mode:** Zero CPU/GPU consumption when tab is hidden via `document.addEventListener('visibilitychange')`.
4. **Resilience & Fault Tolerance:** In the event of an HTTP 503 outage simulation, zero ghost records are written to persistent storage, preserving transactional atomicity.

---

*Authored by the Google DeepMind & Antigravity Advanced Agentic Coding Team.*  
*Design Spec Name:* `BatCavaDesign.md`  
*Target Repository:* `F:\Graphic Designs\AwesomeDesign\awesome-design-md\design-md`
