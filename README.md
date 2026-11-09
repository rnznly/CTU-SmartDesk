# CTU SmartDesk: Campus Service Request Management System

<p align="center">
  <img src="https://img.shields.io/badge/PWA-Ready-27a644?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA Ready" />
  <img src="https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Nginx-Alpine-009639?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx" />
  <img src="https://img.shields.io/badge/Architecture-3--Tier%20Loose%20Coupling-5e6ad2?style=for-the-badge" alt="Architecture" />
  <img src="https://img.shields.io/badge/Test%20Suite-100%25%20Passed-27a644?style=for-the-badge" alt="Tests" />
  <img src="https://img.shields.io/badge/License-MIT%20Custom-blue?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/Institution-Cebu%20Technological%20University-7B1113?style=for-the-badge" alt="CTU" />
</p>

---

### 📋 Examination Information
* **Course:** CC316 – Applications Development and Emerging Technologies
* **Academic Level:** Midterm Practical Examination Project
* **Candidate / Developer:** Laurence Glenn Parojinog
* **Department:** College of Computer, Information and Communications Technology (CCICT)
* **Institution:** Cebu Technological University (CTU)

---

## 📌 Project Overview

The **CTU SmartDesk** is a resilient, modern Progressive Web Application (PWA) engineered to replace manual paper forms and verbal reports for university facility, laboratory, and classroom concerns. 

Engineered with a strict **Contract-First, 3-Tier Architecture**, the system delivers immediate client-side validation, asynchronous network failure resilience (HTTP 503 outage tolerance), offline asset caching, and real-time filtering without requiring an external backend database server.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION TIER (UI)                          │
│          HTML5 Semantic DOM • FormView • ListView • Halftone FX        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Events & Typed Contracts
┌───────────────────────────────────▼────────────────────────────────────┐
│                       APPLICATION LOGIC TIER                           │
│     requestService.js • notificationService.js • soundService.js       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Standardized ApiResponse<T>
┌───────────────────────────────────▼────────────────────────────────────┐
│                         DATA PERSISTENCE TIER                          │
│     mockApi.js (Network & Outage Simulation) • storageService.js       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack & Engineering Tools

| Domain | Technology / Tool | Purpose |
| :--- | :--- | :--- |
| **Frontend Core** | HTML5, Modern CSS3, ES6 JavaScript Modules | Semantic layout, CSS Custom Properties, module encapsulation |
| **PWA Platform** | Service Worker API, Web App Manifest | Cache-First offline asset delivery, standalone display mode |
| **Audio Engine** | Web Audio API (`AudioContext`), HTMLAudioElement | Pre-buffered audio feedback (`scribblenauts.mp3`, `click_pen.mp3`, chimes) |
| **Containerization** | Docker, Docker Compose, Nginx (Alpine Linux) | Isolated production-like HTTP testing and asset delivery |
| **Data Simulation** | In-Memory Async Network Gateway (`mockApi.js`) | Realistic latency (180ms–320ms), HTTP 200/201/400/503 envelopes |
| **Local Storage** | Browser `localStorage` API | JSON entity serialization with integrity protection |

---

## 🚀 How to Run the Application

### Method 1: Using Docker & Nginx (Recommended for Production Testing)
The repository includes containerized orchestration for testing in an isolated Nginx web server:

```bash
# Start the containerized Nginx web server
docker compose up -d

# Verify container status
docker ps
```
Open your browser and navigate to:
```text
http://localhost:8088
```

To stop the container:
```bash
docker compose down
```

---

### Method 2: Using VS Code Live Server
1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click on [`index.html`](index.html) and select **"Open with Live Server"**.
4. The application opens automatically at `http://127.0.0.1:5500/`.

---

### Method 3: Using Python Built-in HTTP Server
```bash
# Run from the project root directory
python -m http.server 8000
```
Then navigate to `http://localhost:8000/`.

---

### Method 4: Using Node.js
```bash
npx serve .
```

> **Note on Service Worker Scope:** PWA Service Workers require either `http://localhost`, `http://127.0.0.1`, or an `https://` connection to register and cache assets securely.

---

## 📂 Project Structure

```text
├── index.html                   # Semantic HTML5 UI (Form, Filter bar, Request cards)
├── favicon.ico                  # Official CTU Seal Favicon
├── manifest.json                # PWA Web App Manifest
├── service-worker.js            # Service Worker (Cache-First asset caching)
├── docker-compose.yml           # Docker orchestration configuration
├── Dockerfile                   # Nginx Alpine container definition
├── LICENSE                      # MIT License with Design & Brand Reservation Clause
├── README.md                    # System documentation
│
├── css/
│   ├── styles.css               # Base layout, Obsidian dark palette, CSS tokens
│   └── components.css           # Forms, buttons, cards, badges, toast notifications
│
├── js/
│   ├── app.js                   # Application bootstrap & coordinator
│   │
│   ├── config/
│   │   └── constants.js         # Central contracts, statuses, concern categories
│   │
│   ├── contracts/
│   │   └── apiContracts.js      # Typed response interfaces (ApiResponse<T>)
│   │
│   ├── data/
│   │   ├── mockApi.js           # Network simulation layer + 503 Outage switch
│   │   └── storageService.js    # LocalStorage persistence gateway
│   │
│   ├── services/
│   │   ├── requestService.js    # Validation engine, collision-free ID generator
│   │   ├── notificationService.js # Toast notifications & status banners
│   │   └── soundService.js      # Tactile Web Audio & sound feedback engine
│   │
│   └── ui/
│       ├── formView.js          # Form UI binding and live field validation
│       ├── listView.js          # Card rendering, search filtering, status transitions
│       └── interactiveHalftone.js # Dynamic wave background physics
│
├── assets/
│   ├── icons/                   # PWA Icons (192x192, 512x512, apple-touch-icon)
│   └── sounds/                  # Auditory feedback assets
│
└── docs/
    ├── api-contracts.md         # Detailed API contracts & response structures
    ├── architecture-diagram.md  # 3-Tier Architecture & loose coupling proof
    ├── contracts.md             # Entity model contracts & constraints
    ├── implementation-blueprint.md # Architecture blueprint & lifecycle rules
    └── usability-testing.md     # Completed usability evaluation report & HOTS analysis
```

---

## 🏆 Exam Criteria Compliance Matrix (100 Points Total)

| Section | Points | Rubric Criteria | Implementation Proof |
| :--- | :---: | :--- | :--- |
| **Part I: Core Features** | **35 pts** | Interactive input form, validation, unique ID generator (`CTU-REQ-YYYYMMDD-XXXX`), status lifecycle transitions, real-time search & filter tabs, tactile alerts. | Implemented in `formView.js`, `listView.js`, and `requestService.js`. |
| **Part II: Architecture & Loose Coupling** | **20 pts** | Strict 3-Tier separation (UI $\leftrightarrow$ Services $\leftrightarrow$ Storage/API). Components communicate exclusively via typed contracts. | Documented in `docs/architecture-diagram.md` and `docs/contracts.md`. |
| **Part III: PWA Implementation** | **20 pts** | Valid `manifest.json`, standalone display, 192px/512px icons, Cache-First service worker (`service-worker.js`), responsive layout, offline reload. | Tested in Chrome/Edge DevTools and containerized Nginx. |
| **Part IV: Usability Evaluation** | **15 pts** | Documented peer usability testing with 3 participants, friction points, implemented improvements, and ISO 9241-11 HOTS analysis. | Fully documented in `docs/usability-testing.md`. |
| **Part V: Technical Challenges** | **10 pts** | **Challenge A:** 503 Server Outage toggle with zero data corruption.<br>**Challenge B:** Real-time inline field validation on blur/input.<br>**Challenge C:** Decoupled status modification without touching UI/Storage. | Verified via automated test suites. |

---

## 🧪 Automated Testing Verification

The codebase includes automated test suites covering DOM contracts, validation rules, collision resistance, and modular status independence:

```bash
# Run UI & PWA Master Audit (67 Tests)
node scripts/test_presentation.js

# Run Master Workflow & Rubric Audit (20 Tests)
node scripts/test_master_workflow.js

# Run Challenge C Modularity & Decoupling Audit
node scripts/test_challenge_c.js
```

### Test Suite Results:
* **Presentation & PWA Audit:** `67 / 67 Passed (100%)`
* **Master Workflow & Outage Audit:** `20 / 20 Passed (100%)`
* **Challenge C Modularity Audit:** `100% Passed`

---

## 🔒 Security & Data Integrity

* **Zero Ghost Records on Outage:** When server outage mode is toggled (HTTP 503), the data layer rejects requests before touching storage, preventing orphaned entries while preserving student input.
* **Deterministic ID Collision Resistance:** The generator combines `YYYYMMDD` with a 4-hex random salt and millisecond timestamp salt, ensuring identical issue descriptions filed simultaneously never collide.
* **Sanitization:** Input values are trimmed and sanitized before validation and rendering to protect against layout corruption and script injection.

---

## 📄 License

This project is licensed under the terms of the **MIT License with Design & Brand Reservation**.

* **What is permitted:** You are free to study, reference, fork, and replicate the architectural ideas, 3-Tier design patterns, offline PWA implementation, and business logic for educational, academic, or personal development.
* **What is reserved:** You may **not** duplicate or clone the official institutional branding, emblems, seals of Cebu Technological University (CTU), or the exact proprietary visual theme flow and color palettes of the author for unauthorized public representation.

See the full [LICENSE](LICENSE) file for complete legal terms.
