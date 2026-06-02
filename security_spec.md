# Security Specification & Threat Model — PJ Industries

This document defines the security boundaries, data invariants, and access control matrices for PJ Industries' Firestore database instance.

## 1. Core Data Invariants

1. **Anonymous / Public Submission Boundaries**:
   - Guests can read standard public data (`products`, `feedbacks`, `configs`).
   - Guests can write inquiries (`contact_queries`, `dealer_queries`) and submit feedback (`feedbacks`).
   - Guests have absolute zero read permissions on inquiries to prevent customer contact exposure or lead leaks.

2. **Corporate & Personnel Data Separation**:
   - HR/Staff configurations (`employees`), attendance rosters (`attendance`), leave logs (`leaves`), and shift work logs (`eod_reports`) are strictly confidential and restricted to authorized personnel.

## 2. The "Dirty Dozen" Malicious Payloads

The following specific JSON payloads are tested and blocked by our security policies (`firestore.rules`):

### T01: Employee Roster Extraction (Identity Leak)
* **Target Path**: `employees/{userId}`
* **Operation**: `list` / `get`
* **Payload**: Non-authenticated read attempt of sensitive bank accounts and Aadhaar.
* **Refusal Reason**: Unauthorized public read.

### T02: Employee Self-Provisioning (Privilege Escalation)
* **Target Path**: `employees/PJ-EMP-MALICIOUS`
* **Operation**: `create`
* **Payload**: `{ "id": "PJ-EMP-MALICIOUS", "fullName": "Attacker", "designation": "Administrator", "salary": 999999 }`
* **Refusal Reason**: Unauthenticated client write.

### T03: Clock Spoofing (Employee Fraud)
* **Target Path**: `attendance/{attendanceId}`
* **Operation**: `create`
* **Payload**: `{ "id": "att-fake-1", "employeeId": "PJ-EMP-101", "punchIn": "09:00:00 AM", "totalHours": 18.0 }`
* **Refusal Reason**: Missing authorization credentials.

### T04: Customer Lead Scraping (Lead Poisoning/Theft)
* **Target Path**: `contact_queries`
* **Operation**: `list`
* **Payload**: Read query trying to extract all mobile numbers of prospective dealers.
* **Refusal Reason**: Read access denied to public clients.

### T05: Phantom Dealership Spams (Resource Denial)
* **Target Path**: `dealer_queries/{id}`
* **Operation**: `create`
* **Payload**: Injection of excessive payload sizes (>2000 chars) in string fields.
* **Refusal Reason**: Map size boundary validation rejection.

### T06: Fake Testimonial Bombing (Reputation Fraud)
* **Target Path**: `feedbacks/{id}`
* **Operation**: `create`
* **Payload**: `{ "id": "fb-fake", "rating": 99, "review": "Spam" }`
* **Refusal Reason**: Rating exceed limit (must be <= 5).

### T07: Dynamic CMS Defacement (Branding Destruction)
* **Target Path**: `configs/about_us`
* **Operation**: `update`
* **Payload**: `{ "story": "Hacked" }`
* **Refusal Reason**: Unauthenticated configuration overwrite blocks.

### T08: Attendance Record Deletion (Evidence Destruction)
* **Target Path**: `attendance/valid-rec-id`
* **Operation**: `delete`
* **Payload**: Delete operation on attendance files.
* **Refusal Reason**: Write/Delete permissions restricted to validated sessions.

### T09: Invalid Id Injection (ID Poisoning/Resource Exhaustion)
* **Target Path**: `products/super-long-malicious-garbage-id-unicode-💥💥💥`
* **Operation**: `create`
* **Payload**: Attempt to seed massive ids to trigger memory exhaustion.
* **Refusal Reason**: `isValidId` check fails.

### T10: Leave Request Manipulation (Process Bypassing)
* **Target Path**: `leaves/request-1`
* **Operation**: `update`
* **Payload**: Modification of leave from "Rejected" to "Approved" by unauthorized client.
* **Refusal Reason**: Blocked due to restricted update actions.

### T11: Questionnaire Injection (System Interruption)
* **Target Path**: `department_configs/{id}`
* **Operation**: `create`
* **Payload**: Seeding custom bogus departments to crash staff dashboard.
* **Refusal Reason**: Restricted to internal backend/authenticated setup.

### T12: Product Pricing Hack (Economic Sabotage)
* **Target Path**: `products/prod-doodh-1`
* **Operation**: `update`
* **Payload**: `{ "price": 0.01 }`
* **Refusal Reason**: Price must be positive float and restricted to admin configuration profiles.
