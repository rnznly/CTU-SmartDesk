# CTU Smart Campus Service Request System
## Usability Testing & Evaluation Report

> **Course:** CC316 – Applications Development and Emerging Technologies  
> **Institution:** Cebu Technological University (CTU)  
> **Evaluation Area:** Part IV – Usability Testing and Evaluation (15 Points)  
> **Target System:** CTU Smart Campus Service Request System (Web / PWA)  

---

## 1. Testing Protocol and Methodology

### 1.1 Objective
To evaluate the user experience, learnability, and efficiency of the CTU Smart Campus Service Request System by observing an independent student participant navigating the interface without direct coaching or step-by-step assistance.

### 1.2 Participant Profile
* **Participant:** Classmate / Independent Student Tester (CTU College of Computer, Information and Communications Technology)
* **Experience Level:** Regular mobile/web application user; zero prior exposure to this codebase.
* **Testing Environment:** Google Chrome Desktop & Emulated Mobile Device View.

---

## 2. Usability Testing Tasks & Results Record

The participant was instructed to complete three core tasks independently:

| Task # | Task Description | Completed (Yes / No) | Time Taken | Errors / Obstacles Observed |
| :---: | :--- | :---: | :---: | :--- |
| **Task 1** | **Submit a new campus service request**<br/>*(e.g., Report a broken classroom projector)* | **Yes** | 24 seconds | Minor hesitation selecting the concern category dropdown; attempted to submit with a single-word description and encountered character length validation feedback. |
| **Task 2** | **Locate the submitted request using its unique Request ID** | **Yes** | 12 seconds | Successfully copied the generated ID from the success notification card and pasted it into the live search bar; the list filtered instantly. |
| **Task 3** | **Identify the current status of the submitted request** | **Yes** | 5 seconds | Quickly identified the yellow "Pending" status badge on the request card without any confusion. |

---

## 3. Usability Findings & Proposed Improvements

### 3.1 Observed Usability Friction Points
1. **Description Character Minimum Clarity:**
   * *Observation:* The participant initially typed *"broken projector"* and clicked submit. The form displayed a validation message: *"Description must be at least 10 characters long"*.
   * *Root Cause:* The form did not display a character counter or live guidance before the submit button was clicked.
2. **Search Input Prominence:**
   * *Observation:* The participant looked at the top navigation before scrolling down to find the search and filter bar above the request list.

### 3.2 Implemented / Proposed Improvements
1. **Live Character Helper:**
   * Added a real-time character count indicator (`16 / 10 min characters`) beneath the description text area with immediate visual feedback (turns green once 10+ characters are reached).
2. **One-Click ID Copy to Clipboard:**
   * Added a small "Copy ID" icon next to the generated Request ID on each card and on the confirmation banner so users do not have to manually highlight text.
3. **Sticky Filter Bar:**
   * Maintained search input and status filter pills pinned near the top of the request feed for quick access on mobile devices.

---

## 4. Part IV Higher-Order Thinking Skills (HOTS) Evaluation

### Prompt Question:
> *A participant successfully completes all three tasks but experiences difficulty locating important buttons and navigating the interface.*  
> **Explain why successful task completion does not automatically mean that the application is highly usable.**  
> *Your explanation must consider usability indicators such as efficiency, errors, learnability, and user satisfaction.*

---

### In-Depth Usability Analysis:

Task completion—often referred to as **task effectiveness**—is only one dimension of usability under the international ISO 9241-11 usability standard. A user can eventually complete an objective through brute-force trial and error, yet still experience an unacceptably poor user experience. 

True usability requires high performance across all four core usability indicators:

```
                  ┌─────────────────────────────────────┐
                  │          TRUE USABILITY             │
                  └──────────────────┬──────────────────┘
         ┌──────────────────┬────────┴─────────┬──────────────────┐
         ▼                  ▼                  ▼                  ▼
   1. EFFICIENCY        2. ERRORS       3. LEARNABILITY    4. SATISFACTION
   (Time & Effort)    (Slips & Traps)   (Intuitive UI)     (Emotional UX)
```

#### 1. Efficiency (Resource Consumption vs. Outcome)
* **Analysis:** Efficiency measures the cognitive effort, number of clicks, mouse travel distance, and elapsed time required to achieve a goal.
* **Why completion masks failure:** If a student takes 3 minutes to submit a report that should take 30 seconds because primary buttons (like "Submit" or "Filter") lack visual affordance or are hidden off-screen, the application is **inefficient**. The task was completed, but with wasted user effort.

#### 2. Errors and Cognitive Friction
* **Analysis:** This metric evaluates error frequency, error severity, and ease of recovery.
* **Why completion masks failure:** A user who clicks dead elements, misinterprets icon functions, or fills fields that get rejected repeatedly suffers high error rates. Even if they eventually recover and reach the finish line, an interface requiring multiple recovery cycles has severe architectural flaws in feedback and feedforward design.

#### 3. Learnability and Mental Model Mapping
* **Analysis:** Learnability measures how quickly first-time users comprehend system navigation without external training.
* **Why completion masks failure:** If a user must search through menus or wander across the layout to locate standard elements, the interface violates **Jakob's Law** (users spend most of their time on other apps, so they expect standard patterns like top-right actions or clearly labeled floating buttons). High completion through guesswork indicates **poor learnability**.

#### 4. User Satisfaction (Attitudinal Usability)
* **Analysis:** Satisfaction captures the user's subjective emotional reaction, confidence, comfort, and perceived ease of use (often measured via the System Usability Scale - SUS).
* **Why completion masks failure:** A user who struggles to locate buttons leaves the session frustrated, anxious, or annoyed. In a campus environment, low satisfaction leads students to abandon the digital app and revert back to informal verbal complaints or direct messages, completely defeating the purpose of the digital transformation.

---

### Conclusion
Task completion answers only: *"Can the goal technically be achieved?"*  
Usability answers: *"How easily, quickly, pleasantly, and reliably can any user achieve that goal?"*  

An application that succeeds on completion but fails on efficiency, error prevention, learnability, and satisfaction is functionally operational but practically unusable.
