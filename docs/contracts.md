# CTU Smart Campus Service Request System
## Technical Specification & Architecture Contracts

> **Course:** CC316 – Applications Development and Emerging Technologies  
> **Institution:** Cebu Technological University (CTU)  
> **Development Paradigm:** Contract-First, Loose Coupling, 3-Tier Architecture  
> **Target Standard:** Progressive Web Application (PWA)

---

## 1. Overview and Design Principles

The **CTU Smart Campus Service Request System** allows students to report campus-related concerns (classroom equipment, laboratory issues, facility maintenance, and others) digitally. 

To satisfy **Part II (Application Architecture and Loose Coupling)** and the **Higher-Order Thinking Skills (HOTS)** requirements, this project follows a **Contract-First approach**:
1. **Separation of Concerns:** Strict isolation between the Presentation Layer (UI), Application Logic Layer (Services), and Data Management Layer (API / Storage).
2. **Predictable Interfaces:** Components communicate exclusively via typed contracts and standardized response envelopes (`ApiResponse<T>`).
3. **Change Resiliency:** Changes to status naming (e.g., *Pending* &rarr; *Submitted*) or data-storage implementations do not require changes to unrelated components.
4. **Fault Tolerance & Reliability:** Explicit handling of network/server failure with zero data corruption.

---

## 2. Entity & Data Model Contracts

### 2.1 Core Entity: `ServiceRequest`
Represents an individual service request stored and tracked in the system.

```typescript
interface ServiceRequest {
  /**
   * Unique system-generated request identifier.
   * Format: "CTU-REQ-{YYYYMMDD}-{4_DIGIT_HEX/RANDOM}"
   * Example: "CTU-REQ-20261109-8F2B"
   * HOTS Constraint: Identical descriptions MUST always generate distinct IDs.
   */
  id: string;

  /**
   * Full name of the student filing the request.
   * Constraints: Required, Min 2 chars, Max 100 chars, trimmed.
   */
  studentName: string;

  /**
   * Category of the reported issue.
   * Constraints: Must be one of ConcernType values.
   */
  concernType: ConcernType;

  /**
   * Detailed explanation of the campus issue.
   * Constraints: Required, Min 10 chars, Max 1000 chars.
   */
  description: string;

  /**
   * Submission timestamp in ISO-8601 string format.
   * Example: "2026-11-09T09:30:00.000Z"
   */
  dateSubmitted: string;

  /**
   * Human-readable formatted date for UI display.
   * Example: "Nov 09, 2026 09:30 AM"
   */
  formattedDate: string;

  /**
   * Current lifecycle state of the request.
   * Constraints: Must be one of RequestStatus values.
   */
  status: RequestStatus;

  /**
   * Timestamp of the most recent status transition or modification.
   */
  updatedAt: string;
}
```

### 2.2 Input DTO: `CreateRequestDTO`
Payload captured from the user interface form before processing.

```typescript
interface CreateRequestDTO {
  studentName: string;
  concernType: string;
  description: string;
}
```

---

## 3. Configuration & State Contracts

### 3.1 Status Contract (`RequestStatus`)
To fulfill the **Part II HOTS Challenge**, status values are managed in a single configuration contract (`constants.js`).

#### Baseline Specification:
```typescript
enum RequestStatus {
  PENDING = "Pending",
  IN_PROGRESS = "In Progress",
  RESOLVED = "Resolved"
}
```

#### Transition State Machine:
```
[ Pending ] ───(Dispatch/Review)───► [ In Progress ] ───(Fix Completed)───► [ Resolved ]
```

#### Alternate Specification (HOTS Challenge C Verification):
```typescript
enum RequestStatusHOTS {
  SUBMITTED = "Submitted",
  UNDER_REVIEW = "Under Review",
  COMPLETED = "Completed"
}
```

### 3.2 Concern Category Contract (`ConcernType`)
```typescript
enum ConcernType {
  CLASSROOM_EQUIPMENT = "Classroom Equipment",
  LABORATORY = "Laboratory",
  FACILITY_MAINTENANCE = "Facility Maintenance",
  OTHERS = "Others"
}
```

---

## 4. API & Data Layer Contract (`IDataService`)

Standardized envelope for all asynchronous operations between the Service Layer and Data Layer.

### 4.1 Response Envelope: `ApiResponse<T>`
```typescript
interface ApiResponse<T> {
  success: boolean;
  status: number; // 200 (OK), 201 (Created), 400 (Bad Request), 500 (Internal Error), 503 (Offline/Unavailable)
  data: T | null;
  error: ApiError | null;
}

interface ApiError {
  code: string;       // e.g. "ERR_NETWORK_FAILURE", "ERR_NOT_FOUND", "ERR_INVALID_PAYLOAD"
  message: string;    // Human-friendly error description
  timestamp: string;  // ISO timestamp of occurrence
}
```

### 4.2 Data Management Interface (`IDataService`)
```typescript
interface IDataService {
  /**
   * Retrieves all persisted service requests.
   */
  getAll(): Promise<ApiResponse<ServiceRequest[]>>;

  /**
   * Retrieves a single service request by its unique identifier.
   */
  getById(id: string): Promise<ApiResponse<ServiceRequest>>;

  /**
   * Persists a newly generated service request.
   */
  save(request: ServiceRequest): Promise<ApiResponse<ServiceRequest>>;

  /**
   * Updates an existing request's attributes (e.g. status transition).
   */
  update(id: string, updates: Partial<ServiceRequest>): Promise<ApiResponse<ServiceRequest>>;

  /**
   * Technical Challenge A Testing Harness:
   * Simulates a failure in data access/network.
   */
  setSimulateFailure(shouldFail: boolean): void;
  getSimulateFailure(): boolean;
}
```

---

## 5. Application / Service Layer Contract (`IRequestService`)

Coordinates validation rules, unique identifier generation, and business workflows.

### 5.1 Validation Contract: `ValidationResult`
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: {
    studentName?: string;
    concernType?: string;
    description?: string;
  };
}
```

### 5.2 Filter & Query Contract: `RequestFilterQuery`
```typescript
interface RequestFilterQuery {
  status?: string;        // "All" or a specific RequestStatus
  searchTerm?: string;    // Case-insensitive match on ID, Student Name, or Description
  concernType?: string;   // Filter by specific concern category
}
```

### 5.3 Service Interface (`IRequestService`)
```typescript
interface IRequestService {
  /**
   * Validates form input against university business rules.
   */
  validate(dto: CreateRequestDTO): ValidationResult;

  /**
   * Generates a collision-resistant unique identifier.
   * Guarantees identical descriptions produce different IDs.
   */
  generateUniqueId(): string;

  /**
   * Processes a new submission: validates, constructs entity, and saves.
   */
  submitRequest(dto: CreateRequestDTO): Promise<ApiResponse<ServiceRequest>>;

  /**
   * Retrieves and filters requests based on search query and status.
   */
  getRequests(filter?: RequestFilterQuery): Promise<ApiResponse<ServiceRequest[]>>;

  /**
   * Updates the lifecycle status of a specific request.
   */
  updateStatus(id: string, newStatus: RequestStatus): Promise<ApiResponse<ServiceRequest>>;
}
```

---

## 6. Presentation / UI Layer Contracts

### 6.1 Notification Feedback Contract (`INotificationService`)
Displays user alerts conforming to Part I Requirement 7 and Technical Challenges A & B.

```typescript
type NotificationType = "success" | "error" | "warning" | "info";

interface INotificationService {
  /**
   * Displays an accessible alert banner/toast.
   */
  show(message: string, type: NotificationType, durationMs?: number): void;

  /**
   * Dismisses any active notifications.
   */
  clear(): void;
}
```

### 6.2 View Event Contracts
The UI communicates with the underlying service exclusively through structured events:

| Event Source | Event Action | Payload | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **Request Form** | `SUBMIT_FORM` | `CreateRequestDTO` | Validates, generates ID, saves, displays success toast, refreshes list |
| **Search Input** | `SEARCH_INPUT` | `{ searchTerm: string }` | Filters request list dynamically without page reload |
| **Status Filter** | `FILTER_STATUS` | `{ status: string }` | Filters request list by status badge |
| **Status Card Action** | `UPDATE_STATUS` | `{ id: string, newStatus: string }` | Updates request status and re-renders card |
| **Failure Toggle** | `TOGGLE_FAILURE` | `{ enabled: boolean }` | Toggles simulated server failure for Technical Challenge A |

---

## 7. Progressive Web App (PWA) Contract

### 7.1 Cache Strategy Specifications
* **Static Assets (Cache-First):** `index.html`, CSS, JavaScript files, icons, and fonts are served directly from cache to ensure 100% offline availability.
* **Data Mutations (Network-First with Fallback):**
  * When online: Operations proceed normally through the data layer.
  * When offline: The application detects `navigator.onLine === false` and displays:
    > *"You are currently offline. New service requests require an active connection."*
  * Prevents false reporting of non-synced data (Part III Requirement B).

---

## 8. Architectural Traceability Matrix

| Exam Requirement | Governing Contract | Responsible Module |
| :--- | :--- | :--- |
| **Req 1 & 2:** Form & Input Validation | `CreateRequestDTO`, `ValidationResult` | `requestService.js` + `formView.js` |
| **Req 3 & 5:** Submit, Display, Status | `ServiceRequest`, `RequestStatus` | `requestService.js` + `listView.js` |
| **Req 4 & HOTS 1:** Unique Request ID | `generateUniqueId()` | `requestService.js` |
| **Req 6:** Search & Filter Requests | `RequestFilterQuery` | `requestService.js` + `listView.js` |
| **Req 7:** Success & Error Alerts | `ApiResponse<T>`, `INotificationService` | `notificationService.js` |
| **Part II & HOTS 2:** Modularity & Status Change | `RequestStatus` enum in `constants.js` | `constants.js` (Centralized Config) |
| **Part III:** PWA & Offline Support | PWA Cache Strategy Contract | `service-worker.js` + `manifest.json` |
| **Part V Challenge A:** Server Failure Graceful Handling | `ApiResponse<T>`, `setSimulateFailure()` | `mockApi.js` + `notificationService.js` |
| **Part V Challenge B:** Form Validation Prevention | `ValidationResult` | `requestService.js` + `formView.js` |
| **Part V Challenge C:** Component Loose Coupling | 3-Tier Layered Contracts | All ES Modules |
