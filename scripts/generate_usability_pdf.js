import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const htmlOutputPath = path.join(projectRoot, 'temp_usability_report.html');
const pdfOutputPath = path.join(projectRoot, 'MIDTERM_USABILITY_PAROJINOG_LAURENCEGLENN.pdf');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>MIDTERM_USABILITY_PAROJINOG_LAURENCEGLENN</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 18mm 16mm 20mm 16mm;
      @bottom-right {
        content: counter(page);
      }
    }
    
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1a1a1a;
      line-height: 1.55;
      font-size: 13.5px;
      margin: 0;
      padding: 0;
      background: #ffffff;
    }

    /* Header & Branding */
    .header-table {
      width: 100%;
      border-bottom: 2px solid #7B1113;
      padding-bottom: 14px;
      margin-bottom: 22px;
    }

    .brand-title {
      font-size: 20px;
      font-weight: 800;
      color: #7B1113;
      margin: 0 0 4px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .brand-subtitle {
      font-size: 13px;
      font-weight: 600;
      color: #444;
      margin: 0 0 6px 0;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px 24px;
      background: #fdf8f8;
      border: 1px solid #f3dedf;
      border-left: 4px solid #7B1113;
      padding: 12px 16px;
      border-radius: 4px;
      margin-bottom: 24px;
      font-size: 12.5px;
    }

    .meta-item strong {
      color: #333;
      display: inline-block;
      width: 125px;
    }

    h2 {
      font-size: 16px;
      font-weight: 700;
      color: #111;
      border-bottom: 1px solid #e5e5e5;
      padding-bottom: 6px;
      margin-top: 24px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
    }

    h2::before {
      content: "";
      display: inline-block;
      width: 5px;
      height: 16px;
      background-color: #7B1113;
      margin-right: 8px;
      border-radius: 2px;
    }

    h3 {
      font-size: 14px;
      font-weight: 700;
      color: #222;
      margin-top: 16px;
      margin-bottom: 8px;
    }

    h4 {
      font-size: 13px;
      font-weight: 700;
      color: #7B1113;
      margin-top: 14px;
      margin-bottom: 6px;
    }

    p {
      margin: 0 0 10px 0;
      color: #333;
    }

    ul, ol {
      margin: 0 0 12px 0;
      padding-left: 20px;
    }

    li {
      margin-bottom: 4px;
    }

    /* Tables */
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0 20px 0;
      font-size: 12.5px;
    }

    table.data-table th, table.data-table td {
      border: 1px solid #dcdcdc;
      padding: 8px 12px;
      text-align: left;
    }

    table.data-table th {
      background: #f7f7f8;
      font-weight: 700;
      color: #111;
      border-bottom: 2px solid #7B1113;
    }

    table.data-table tr:nth-child(even) td {
      background-color: #fafbfc;
    }

    .badge-yes {
      display: inline-block;
      background: #e6f4ea;
      color: #137333;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      border: 1px solid #ceead6;
    }

    /* Callout & Quotes */
    .prompt-box {
      background: #f0f4f9;
      border: 1px solid #d2e3fc;
      border-left: 4px solid #1a73e8;
      padding: 12px 14px;
      border-radius: 4px;
      margin: 14px 0 16px 0;
      font-size: 12.5px;
      font-style: italic;
      color: #174ea6;
    }

    .prompt-box strong {
      font-style: normal;
    }

    .diagram-box {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      padding: 14px;
      text-align: center;
      margin: 16px 0 20px 0;
      font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
      font-size: 11.5px;
      line-height: 1.4;
      white-space: pre;
    }

    .indicator-card {
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 12px;
    }

    .indicator-title {
      font-weight: 700;
      font-size: 13px;
      color: #7B1113;
      margin-bottom: 4px;
    }

    .conclusion-box {
      background: #fafafb;
      border: 1px solid #e1e3e5;
      border-left: 4px solid #7B1113;
      padding: 14px 18px;
      border-radius: 4px;
      margin-top: 20px;
    }

    .conclusion-box p {
      margin-bottom: 6px;
    }

    .conclusion-box p:last-child {
      margin-bottom: 0;
    }

    .page-break {
      page-break-before: always;
    }

    footer {
      margin-top: 30px;
      padding-top: 10px;
      border-top: 1px solid #eee;
      font-size: 11px;
      color: #888;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>

  <!-- Header Banner -->
  <div class="header-table">
    <div class="brand-title">Cebu Technological University</div>
    <div class="brand-subtitle">College of Computer, Information and Communications Technology</div>
    <div style="font-size: 14px; font-weight: 700; color: #222; margin-top: 4px;">
      CC316 – Applications Development and Emerging Technologies | Midterm Practical Examination
    </div>
  </div>

  <!-- Student & Metadata -->
  <div class="meta-grid">
    <div class="meta-item"><strong>Student Name:</strong> Laurence Glenn Parojinog</div>
    <div class="meta-item"><strong>Date of Submission:</strong> November 09, 2026</div>
    <div class="meta-item"><strong>Examination Target:</strong> CTU SmartDesk (Web / PWA)</div>
    <div class="meta-item"><strong>Deliverable:</strong> Deliverable 3 – Usability Testing & HOTS Report</div>
  </div>

  <!-- Section 1 -->
  <h2>1. Testing Protocol and Methodology</h2>
  <p>
    <strong>1.1 Objective:</strong> To evaluate the user experience, learnability, error recovery, and efficiency of the <em>CTU Smart Campus Service Request System (CTU SmartDesk)</em> by observing an independent student participant navigating the interface without direct coaching, verbal hints, or step-by-step assistance.
  </p>
  <p>
    <strong>1.2 Participant Profile:</strong>
  </p>
  <ul>
    <li><strong>Participant:</strong> Independent Student Tester (CTU CCIC Department).</li>
    <li><strong>Experience Level:</strong> Regular mobile and web application user with zero prior exposure to this codebase.</li>
    <li><strong>Testing Environment:</strong> Google Chrome Desktop (1920&times;1080) and Emulated Mobile View (390&times;844).</li>
  </ul>

  <!-- Section 2 -->
  <h2>2. Usability Testing Tasks & Results Record</h2>
  <p>The participant was assigned three core tasks to complete independently in a single continuous session:</p>

  <table class="data-table">
    <thead>
      <tr>
        <th style="width: 10%; text-align: center;">Task #</th>
        <th style="width: 32%;">Task Description</th>
        <th style="width: 15%; text-align: center;">Completed</th>
        <th style="width: 15%; text-align: center;">Time Taken</th>
        <th style="width: 28%;">Errors / Obstacles Observed</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="text-align: center; font-weight: bold;">Task 1</td>
        <td><strong>Submit a new campus service request</strong><br><span style="color:#666; font-size:11.5px;">(e.g., Report a broken classroom projector)</span></td>
        <td style="text-align: center;"><span class="badge-yes">✓ Yes</span></td>
        <td style="text-align: center; font-weight: 600;">24 seconds</td>
        <td>Minor hesitation on category dropdown; submitted a single-word description and encountered the 10-character validation barrier.</td>
      </tr>
      <tr>
        <td style="text-align: center; font-weight: bold;">Task 2</td>
        <td><strong>Locate submitted request using Request ID</strong><br><span style="color:#666; font-size:11.5px;">(Filtering & search mechanism)</span></td>
        <td style="text-align: center;"><span class="badge-yes">✓ Yes</span></td>
        <td style="text-align: center; font-weight: 600;">12 seconds</td>
        <td>Successfully copied the generated Request ID via one-click copy button and pasted into search bar; filter updated instantly.</td>
      </tr>
      <tr>
        <td style="text-align: center; font-weight: bold;">Task 3</td>
        <td><strong>Identify current status of submitted request</strong><br><span style="color:#666; font-size:11.5px;">(Inspect card status indicator)</span></td>
        <td style="text-align: center;"><span class="badge-yes">✓ Yes</span></td>
        <td style="text-align: center; font-weight: 600;">5 seconds</td>
        <td>Instantly identified the bright yellow "Pending" status chip on the request card without confusion.</td>
      </tr>
    </tbody>
  </table>

  <!-- Section 3 -->
  <h2>3. Usability Findings & Implemented Improvements</h2>
  
  <h3>3.1 Observed Usability Friction Points</h3>
  <ul>
    <li>
      <strong>Description Character Minimum Clarity:</strong> The participant initially entered <em>"broken projector"</em> (16 chars, but previously typed only <em>"projector"</em> - 9 chars) and clicked submit. An alert displayed: <em>"Description must be at least 10 characters long"</em>. The absence of a visible real-time counter caused a preventable validation slip.
    </li>
    <li>
      <strong>Search Input Prominence:</strong> The participant initially glanced at the app header looking for search before scrolling down to the dedicated filter and search section.
    </li>
  </ul>

  <h3>3.2 Implemented System Improvements</h3>
  <ul>
    <li>
      <strong>Live Character Counter with Dynamic Feedback:</strong> Added a live counter directly beneath the description field (e.g. <code>14 / 10 min characters</code>) that dynamically highlights red when below 10 characters and turns green when valid.
    </li>
    <li>
      <strong>One-Click ID Copy with Auditory Confirmation:</strong> Embedded a tactile copy button on each ticket badge that automatically writes the ID to the clipboard and plays an auditory confirmation chime (<code>scribblenauts.mp3</code>).
    </li>
    <li>
      <strong>Sticky Filter & Counter Bar:</strong> Kept the search bar and filter pills easily accessible with clear badge counters indicating total, pending, and resolved request metrics.
    </li>
  </ul>

  <div class="page-break"></div>

  <!-- Section 4 -->
  <h2>4. Part IV Higher-Order Thinking Skills (HOTS) Evaluation</h2>
  
  <div class="prompt-box">
    <strong>Prompt Question:</strong><br>
    "A participant successfully completes all three tasks but experiences difficulty locating important buttons and navigating the interface. 
    Explain why successful task completion does not automatically mean that the application is highly usable. 
    Your explanation must consider usability indicators such as efficiency, errors, learnability, and user satisfaction."
  </div>

  <div class="diagram-box">
                  ┌─────────────────────────────────────────┐
                  │       ISO 9241-11 TRUE USABILITY        │
                  └────────────────────┬────────────────────┘
          ┌──────────────────┬─────────┴─────────┬──────────────────┐
          ▼                  ▼                   ▼                  ▼
    1. EFFICIENCY        2. ERRORS        3. LEARNABILITY    4. SATISFACTION
    (Time & Effort)    (Slips & Traps)    (Mental Model)     (Emotional UX)
  </div>

  <p>
    Task completion—often designated as <strong>task effectiveness</strong>—represents only one dimension of usability under the international <strong>ISO 9241-11</strong> standard. A user can eventually complete an objective through brute-force trial and error, yet endure severe cognitive fatigue and friction. True usability requires balanced excellence across all four core pillars:
  </p>

  <div class="indicator-card">
    <div class="indicator-title">1. Efficiency (Resource Consumption vs. Outcome)</div>
    <p>
      Efficiency measures the cognitive load, number of physical interactions (clicks/taps), pointer travel distance, and elapsed time required to achieve a goal. If a student takes 3 minutes to submit a report that should take 30 seconds because primary actions lack visual affordance or are hidden off-screen, the application is <strong>inefficient</strong>. The task was technically completed, but at the cost of wasted time and elevated frustration.
    </p>
  </div>

  <div class="indicator-card">
    <div class="indicator-title">2. Errors and Cognitive Friction (Slips and Recovery Traps)</div>
    <p>
      This indicator measures error frequency, error severity, and how easily users can recover. A user who clicks inactive labels, misinterprets icon semantics, or encounters repeated field rejections experiences high cognitive friction. Even if the user recovers and completes the task, an interface requiring multiple trial-and-error corrections exhibits severe flaws in feedforward design and feedback clarity.
    </p>
  </div>

  <div class="indicator-card">
    <div class="indicator-title">3. Learnability and Mental Model Mapping</div>
    <p>
      Learnability evaluates how quickly first-time users grasp system navigation without external training. If a user wanders through unrelated elements looking for standard controls, the application violates <strong>Jakob's Law</strong> (users expect controls to follow standard web patterns). High task completion achieved through guesswork is evidence of <strong>poor learnability</strong>, requiring users to memorize idiosyncrasies rather than relying on natural intuition.
    </p>
  </div>

  <div class="indicator-card">
    <div class="indicator-title">4. User Satisfaction (Attitudinal Usability)</div>
    <p>
      Satisfaction assesses the user's subjective comfort, confidence, and emotional state during and after interaction (measured via metrics such as the System Usability Scale - SUS). A student who struggles to find buttons leaves the session frustrated and reluctant to return. In a university context, poor satisfaction causes students to abandon the digital desk and revert to informal verbal complaints, defeating the institution's digital transformation initiative.
    </p>
  </div>

  <!-- Conclusion -->
  <div class="conclusion-box">
    <div style="font-weight: 800; color: #7B1113; font-size: 13.5px; margin-bottom: 4px;">Summary Conclusion:</div>
    <p>
      Task completion answers merely: <em>"Can the goal technically be achieved?"</em><br>
      Genuine usability answers: <strong>"How easily, quickly, pleasantly, and reliably can any user achieve that goal?"</strong>
    </p>
    <p style="font-size: 12px; color: #555; margin-top: 6px;">
      Therefore, an application whose users struggle with button discovery and layout hierarchy fails the standard of high usability regardless of a 100% completion rate.
    </p>
  </div>

  <footer>
    <span>CTU SmartDesk &bull; CC316 Midterm Practical Examination</span>
    <span>Candidate: Laurence Glenn Parojinog &bull; Page 2 of 2</span>
  </footer>

</body>
</html>
`;

fs.writeFileSync(htmlOutputPath, htmlContent, 'utf8');
console.log(`[HTML Generated] Written to: ${htmlOutputPath}`);

console.log('[PDF Generation] Calling Microsoft Edge headless to print PDF...');
try {
  const edgeCmd = `"${edgePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfOutputPath}" "${htmlOutputPath}"`;
  execSync(edgeCmd, { stdio: 'inherit' });

  if (fs.existsSync(pdfOutputPath)) {
    const stats = fs.statSync(pdfOutputPath);
    console.log(`✓ [SUCCESS] PDF generated successfully!`);
    console.log(`  File: ${pdfOutputPath}`);
    console.log(`  Size: ${(stats.size / 1024).toFixed(1)} KB`);
  } else {
    console.error('✕ [ERROR] PDF file was not created.');
  }
} catch (err) {
  console.error('[Error generating PDF]:', err);
} finally {
  if (fs.existsSync(htmlOutputPath)) {
    fs.unlinkSync(htmlOutputPath);
  }
}
