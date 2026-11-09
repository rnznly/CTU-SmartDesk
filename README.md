# CTU Smart Campus Service Request System
> **CC316 – Applications Development and Emerging Technologies**  
> **Midterm Practical Examination Project**  
> **Institution:** Cebu Technological University (CTU)

---

## 📌 Project Overview
The **CTU Smart Campus Service Request System** is a responsive Progressive Web Application (PWA) designed to replace paper forms and verbal reports for campus facility concerns. It allows students to submit, track, and monitor service requests with real-time feedback, offline access, and robust error handling.

---

## 🚀 How to Run the Application

This application is built with standard modern Web Technologies (HTML5, CSS3, ES6 JavaScript Modules) and Service Worker APIs.

### Option 1: Using VS Code "Live Server" (Recommended)
1. Open this project folder in **Visual Studio Code**.
2. Install the **Live Server** extension (by Ritwick Dey) if not already installed.
3. Right-click on `index.html` and select **"Open with Live Server"**.
4. The application will open at `http://127.0.0.1:5500/index.html`.

### Option 2: Using Python (Built-in Web Server)
If you have Python installed, open your terminal in this directory and run:
```bash
python -m http.server 8000
```
Then open your browser and navigate to: `http://localhost:8000`.

### Option 3: Using Node.js (npx serve)
```bash
npx serve .
```

> **Note on Service Workers:** Progressive Web Application (PWA) service workers require either `http://localhost` or `https://` to register and cache assets for security reasons.

---

## 📂 Project Structure & Architecture

```text
├── index.html                   # Semantic HTML5 UI (Form, Filter bar, Request cards)
├── manifest.json                # PWA Web App Manifest
├── service-worker.js            # PWA Service Worker (Offline asset caching)
├── README.md                    # Setup & submission documentation
│
├── css/
│   ├── styles.css               # Base layout, typography, responsive grid
│   └── components.css           # Forms, buttons, cards, badges, toast notifications
│
├── js/
│   ├── config/
│   │   └── constants.js         # Central contracts, statuses, concern categories
│   │
│   ├── data/
│   │   ├── storageService.js    # LocalStorage persistence gateway
│   │   └── mockApi.js           # API simulation layer + failure simulation switch
│   │
│   ├── services/
│   │   ├── requestService.js    # Validation engine, ID generator, business logic
│   │   └── notificationService.js # User feedback toast/alert system
│   │
│   ├── ui/
│   │   ├── formView.js          # Form UI binding and live field validation
│   │   └── listView.js          # Card rendering, search filtering, status badges
│   │
│   └── app.js                   # Application bootstrap & coordinator
│
├── assets/
│   ├── icons/                   # PWA Icons (192x192, 512x512)
│   └── ctu-logo.svg             # CTU branding asset
│
└── docs/
    ├── contracts.md             # Formal Contract-First technical specifications
    ├── architecture-diagram.md  # 3-Tier Architecture & loose coupling proof
    ├── usability-testing.md     # Completed usability test record & HOTS analysis
    └── video-presentation-script.md # 9-step rehearsal guide for video recording
```

---

## 🏆 Exam Criteria Compliance Matrix

| Component | Points | Implementation Details |
| :--- | :---: | :--- |
| **Part I: Core Features** | 35 | Form, validation, unique ID generation (`CTU-REQ-xxx`), status transitions, search/filtering, alert banners. |
| **Part II: Architecture & Loose Coupling** | 20 | 3-Tier separation (UI &harr; Service &harr; Data). Status changes configurable in `constants.js` without touching UI or Storage code. |
| **Part III: PWA Implementation** | 20 | Service Worker caching (`service-worker.js`), `manifest.json`, offline reload capability, mobile-first responsive layout. |
| **Part IV: Usability Evaluation** | 15 | Documented peer testing table, UX friction analysis, and ISO 9241-11 HOTS analysis. |
| **Part V: Technical Challenges (A, B, C)** | 10 | Interactive server failure toggle (Challenge A), strict live validation (Challenge B), and decoupled status modification (Challenge C). |

---

## 🎥 Video Demonstration Guide
For the complete step-by-step recording script and timing breakdown for the 9-sequence video submission, see [docs/video-presentation-script.md](docs/video-presentation-script.md).
