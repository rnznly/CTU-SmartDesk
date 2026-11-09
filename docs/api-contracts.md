# SmartDesk API Contracts Specification
## RESTful Endpoints, Schemas, & Data Exchange Protocols

> **Standard:** OpenAPI / RESTful JSON Contract  
> **Architecture Layer:** Tier 2 (Application Service) &harr; Tier 3 (Data Management Gateway)  
> **Response Envelope:** Standardized Unified `ApiResponse<T>`

---

## 1. Unified Response Envelope Contract

Every API operation within the SmartDesk system returns a standardized response envelope. This guarantees that consumers (Presenters / UI Controllers) never need to guess the structure of successful or failed operations.

### JSON Schema Definition:
```typescript
interface ApiResponse<T> {
  success: boolean;       // True if operation succeeded, false otherwise
  status: number;         // HTTP status code equivalent (200, 201, 400, 404, 503)
  data: T | null;         // Payload on success; null on failure
  error: ApiError | null; // Error details on failure; null on success
  meta?: {
    timestamp: string;    // ISO-8601 timestamp of response
    count?: number;       // Record count for list responses
  };
}

interface ApiError {
  code: string;           // Machine-readable error code (e.g., 'ERR_SERVER_UNAVAILABLE')
  message: string;        // Human-friendly description for UI alert banners
  fieldErrors?: Record<string, string>; // Field-specific validation failures
}
```

---

## 2. API Endpoint Specifications

### 2.1 Retrieve All Requests
Retrieves persisted service requests with optional search and status filtering.

* **Method:** `GET`
* **Endpoint:** `/api/requests`
* **Query Parameters:**
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `status` | string | No | Filter by request status (`All`, `Pending`, `In Progress`, `Resolved`) |
  | `search` | string | No | Case-insensitive query matching ID, Student Name, or Description |
  | `concernType` | string | No | Filter by concern category |

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "status": 200,
  "data": [
    {
      "id": "REQ-20261109-7A1C",
      "studentName": "Juan Dela Cruz",
      "concernType": "Classroom Equipment",
      "description": "Projector in Room 304 has a burnt lamp and will not power on.",
      "dateSubmitted": "2026-11-09T09:30:00.000Z",
      "formattedDate": "Nov 09, 2026, 09:30 AM",
      "status": "Pending",
      "updatedAt": "2026-11-09T09:30:00.000Z"
    }
  ],
  "error": null,
  "meta": {
    "timestamp": "2026-11-09T09:30:05.120Z",
    "count": 1
  }
}
```

---

### 2.2 Retrieve Request by ID
Locates an individual request by its unique tracking identifier.

* **Method:** `GET`
* **Endpoint:** `/api/requests/:id`

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "status": 200,
  "data": {
    "id": "REQ-20261109-7A1C",
    "studentName": "Juan Dela Cruz",
    "concernType": "Classroom Equipment",
    "description": "Projector in Room 304 has a burnt lamp and will not power on.",
    "dateSubmitted": "2026-11-09T09:30:00.000Z",
    "formattedDate": "Nov 09, 2026, 09:30 AM",
    "status": "Pending",
    "updatedAt": "2026-11-09T09:30:00.000Z"
  },
  "error": null
}
```

#### Error Response (`404 Not Found`):
```json
{
  "success": false,
  "status": 404,
  "data": null,
  "error": {
    "code": "ERR_NOT_FOUND",
    "message": "Service request with ID 'REQ-INVALID-9999' was not found."
  }
}
```

---

### 2.3 Create New Service Request
Validates and persists a new student concern.

* **Method:** `POST`
* **Endpoint:** `/api/requests`
* **Request Body (`CreateRequestDTO`):**
```json
{
  "studentName": "Maria Santos",
  "concernType": "Laboratory",
  "description": "Desktop PC #12 in Computer Lab 3 has a faulty network card."
}
```

#### Validation Constraints Contract:
* `studentName`: String, trimmed, length between $2$ and $100$ characters.
* `concernType`: Must be one of `Classroom Equipment`, `Laboratory`, `Facility Maintenance`, `Others`.
* `description`: String, trimmed, minimum $10$ characters, maximum $1000$ characters.

#### Success Response (`201 Created`):
```json
{
  "success": true,
  "status": 201,
  "data": {
    "id": "REQ-20261109-4E9D",
    "studentName": "Maria Santos",
    "concernType": "Laboratory",
    "description": "Desktop PC #12 in Computer Lab 3 has a faulty network card.",
    "dateSubmitted": "2026-11-09T09:45:00.000Z",
    "formattedDate": "Nov 09, 2026, 09:45 AM",
    "status": "Pending",
    "updatedAt": "2026-11-09T09:45:00.000Z"
  },
  "error": null
}
```

#### Client Error Response (`400 Bad Request` - Technical Challenge B):
```json
{
  "success": false,
  "status": 400,
  "data": null,
  "error": {
    "code": "ERR_VALIDATION_FAILED",
    "message": "Input validation failed. Please correct the highlighted fields.",
    "fieldErrors": {
      "studentName": "Student name must be at least 2 characters long.",
      "description": "Description must be at least 10 characters long."
    }
  }
}
```

#### Simulated Server Error Response (`503 Service Unavailable` - Technical Challenge A):
```json
{
  "success": false,
  "status": 503,
  "data": null,
  "error": {
    "code": "ERR_SERVER_UNAVAILABLE",
    "message": "Server communication failure: Unable to reach the service data gateway. Please try again."
  }
}
```

---

### 2.4 Update Request Lifecycle Status
Transitions the state of an existing service request.

* **Method:** `PATCH`
* **Endpoint:** `/api/requests/:id/status`
* **Request Body:**
```json
{
  "status": "In Progress"
}
```

#### Allowed State Transitions:
```
Pending ────────► In Progress ────────► Resolved
(Or HOTS alternate: Submitted ──► Under Review ──► Completed)
```

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "status": 200,
  "data": {
    "id": "REQ-20261109-7A1C",
    "status": "In Progress",
    "updatedAt": "2026-11-09T10:15:00.000Z"
  },
  "error": null
}
```

---

### 2.5 Test Harness: Toggle Failure Simulation
Internal test control used to demonstrate **Technical Challenge A** without touching application source code.

* **Method:** `POST`
* **Endpoint:** `/api/test/toggle-failure`
* **Request Body:**
```json
{
  "enabled": true
}
```

#### Success Response (`200 OK`):
```json
{
  "success": true,
  "status": 200,
  "data": {
    "simulateFailure": true,
    "notice": "Mock API is now simulating a complete 503 Server Failure."
  },
  "error": null
}
```

---

## 3. Standard HTTP Status Code Mapping

| Status Code | Reason Phrase | Usage Scenario |
| :---: | :--- | :--- |
| `200` | OK | Successful retrieval (`GET`) or update (`PATCH`). |
| `201` | Created | Successfully submitted and persisted service request (`POST`). |
| `400` | Bad Request | Form payload failed validation rules (Technical Challenge B). |
| `404` | Not Found | Requested Request ID does not exist in storage. |
| `503` | Service Unavailable | Simulated database outage / offline network failure (Technical Challenge A). |
