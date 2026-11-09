# CTU Smart Campus Service Request System
## Video Demonstration Presentation Script & Walkthrough Guide

> **Course:** CC316 – Applications Development and Emerging Technologies  
> **Institution:** Cebu Technological University (CTU)  
> **Evaluation Area:** Deliverable 2 – Video Demonstration (All Sequences & Challenges)  
> **Format:** MP4 (`MIDTERM_DEMO_SURNAME_FIRSTNAME.mp4`) or accessible Google Drive Link  

---

## Preparation Checklist Before Recording
1. Open the application in Google Chrome or Microsoft Edge.
2. Open Chrome Developer Tools (**F12** or `Ctrl+Shift+I`) docked to the right side (ready for Network throttling and Application tab).
3. Have your microphone tested and screen recorder (e.g., OBS Studio, Windows Game Bar `Win + G`, or Loom) set to 1080p.
4. Have your code editor (VS Code) open with `constants.js` and `mockApi.js` ready.

---

## 9-Step Video Presentation Sequence

### Sequence 1: Introduction and Overview (Suggested: 1 - 2 mins)
* **What to Show on Screen:** The full application homepage running in the browser.
* **Spoken Script:**
  > *"Good day, instructor and evaluators. My name is [Your Full Name], and this is my hands-on practical examination for CC316 – Applications Development and Emerging Technologies.*  
  > *Today, I am demonstrating the **CTU Smart Campus Service Request System**, a web-based Progressive Web Application designed for Cebu Technological University students to digitally report, track, and monitor campus facility concerns—replacing paper forms and disorganized direct messages.*  
  > *In this demonstration, I will walk you through the core application features, our 3-tier modular architecture, progressive web app offline caching, usability test findings, and all three mandatory technical challenges."*

---

### Sequence 2: Demonstration of Required Application Features (Suggested: 3 - 4 mins)
* **What to Show on Screen:**
  1. Fill out the request form:
     - Student Name: `Juan Dela Cruz`
     - Type of Concern: `Classroom Equipment`
     - Description: `Classroom 304 projector lamp is flickering and shutting off intermittently during lectures.`
     - Submit request.
  2. Point out the newly generated **Request ID** (e.g., `CTU-REQ-202611-xxxx`) and the initial status badge (`Pending`).
  3. **HOTS 1 Demonstration (Identical Descriptions):**
     - Submit a second request with a different student name (`Maria Santos`), same category, and the **exact same description**:  
       `Classroom 304 projector lamp is flickering and shutting off intermittently during lectures.`
     - Show that the system generated a completely separate unique ID and tracks it independently. Neither record was overwritten or combined.
  4. **Search and Filter Demo:**
     - Type the ID in the live search input — shows only that request.
     - Click the filter buttons: `Pending`, `In Progress`, `Resolved`, and `All`.
     - Update one request's status from `Pending` &rarr; `In Progress` &rarr; `Resolved`.

---

### Sequence 3: Explanation of Architecture & Modular Components (Suggested: 3 mins)
* **What to Show on Screen:** Open the code editor and show the project folder structure alongside the `architecture-diagram.md`.
* **Spoken Script:**
  > *"Our application follows a strict 3-tier modular architecture with loose coupling:*  
  > *1. **Presentation / UI Layer** in `index.html` and `js/ui/`: Responsible purely for DOM rendering, capturing clicks, and triggering toast notifications.*  
  > *2. **Application / Service Layer** in `js/services/requestService.js`: Holds all business logic, input validation schemas, search filtering, and unique ID generation. It has zero knowledge of HTML DOM elements.*  
  > *3. **Data Management Layer** in `js/data/mockApi.js` and `storageService.js`: Serves as our storage abstraction layer. It returns standardized `ApiResponse` objects with HTTP status codes and error payloads.*  
  > *Because these layers communicate through typed contracts and defined interfaces, replacing our local storage with an online SQL backend requires changes ONLY to the data layer, leaving the UI and business logic untouched."*

---

### Sequence 4: Demonstration of PWA Features & Offline Capability (Suggested: 3 mins)
* **What to Show on Screen:**
  1. Open DevTools &rarr; **Application** tab:
     - Show **Manifest**: Name, Short Name, Start URL, Theme Color, and Icons.
     - Show **Service Workers**: Status is `Activated and running`.
     - Show **Cache Storage**: Static cache contains `index.html`, CSS, and JS scripts.
  2. In DevTools &rarr; **Network** tab:
     - Set Throttling from *No throttling* to **Offline**.
  3. **Reload the page while completely offline:**
     - The page reloads seamlessly from the service worker cache!
  4. Attempt a server-dependent action while offline:
     - The app displays an accessible notice: *"You are currently offline. New service requests require an active connection."*
     - Point out that the system handles this gracefully without falsely claiming success.

---

### Sequence 5: Presentation of Usability Testing Results (Suggested: 2 - 3 mins)
* **What to Show on Screen:** Display `docs/usability-testing.md`.
* **Spoken Script:**
  > *"For Part IV, I conducted an independent usability test with a classmate with zero prior exposure to the system. The participant performed three tasks: submitting a report, locating it by ID, and checking its status.*  
  > *All three tasks were successfully completed in under 25 seconds.*  
  > *However, as addressed in our HOTS analysis: **task completion does not equal high usability**. The participant experienced minor hesitation with character requirements. While the task was completed, true usability requires high efficiency, low error rates, high learnability, and user satisfaction.*  
  > *To address this, we added real-time character count feedback and one-click ID copying to ensure frictionless user experience."*

---

### Sequence 6: Challenge A – Server Failure Handling (Suggested: 3 mins)
* **What to Show on Screen:**
  1. Show normal operation first (submit a test request, show green success toast).
  2. Toggle **Simulate Server Failure** switch (in the developer control bar).
  3. Attempt to submit a new request.
  4. Point out the system behavior:
     - Red alert banner: *"Server Error (503): Service temporarily unavailable. Your request could not be saved."*
     - Show the request list: No phantom card is added.
     - Point out that the user is clearly informed and never misled into thinking their request succeeded.
  5. Toggle failure back to OFF, submit again, and show normal recovery.

---

### Sequence 7: Challenge B – Input Validation (Suggested: 3 mins)
* **What to Show on Screen:**
  1. Click "Submit Request" with an empty form.
     - Red validation highlights appear on Student Name, Concern Type, and Description.
     - Submission is strictly blocked.
  2. Enter invalid data:
     - Student Name: `J` (too short).
     - Description: `bad` (fewer than 10 characters).
     - Show the dynamic validation messages explaining exactly what is wrong.
  3. Correct the entries with valid information.
  4. Click submit &rarr; validation passes, errors clear, and the request is successfully saved.

---

### Sequence 8: Challenge C – Component Modification & Loose Coupling (Suggested: 3 mins)
* **What to Show on Screen:**
  1. Show the current status badges: `Pending`, `In Progress`, `Resolved`.
  2. Switch to VS Code &rarr; open `js/config/constants.js`.
  3. Modify the status labels to the HOTS requirement:
     - `Pending` &rarr; `Submitted`
     - `In Progress` &rarr; `Under Review`
     - `Resolved` &rarr; `Completed`
  4. Save `constants.js` and switch back to the browser.
  5. Demonstrate:
     - Filter buttons immediately reflect the new statuses (`Submitted`, `Under Review`, `Completed`).
     - Request card badges update their labels.
     - Form and search logic remain fully functional.
  6. **Explanation:**
     > *"This demonstrates loose coupling: because our components rely on central configuration contracts rather than hardcoded UI strings, modifying business statuses requires zero edits to UI handlers, event listeners, or storage routines."*

---

### Sequence 9: Technical Decisions & Conclusion (Suggested: 1 - 2 mins)
* **Spoken Script:**
  > *"In summary, the CTU Smart Campus Service Request System fulfills all functional, architectural, and PWA criteria set forth in CC316.*  
  > *By leveraging contract-first modularity, collision-resistant unique identification, service worker asset caching, and robust error boundaries, we delivered a system that remains resilient in the face of changing requirements, user error, and network disruptions.*  
  > *Thank you for your time and evaluation."*
