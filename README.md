# Bethel Ministries International — Management System (BMI UMS)

[![CI Pipeline](https://github.com/bmi-edu/ums-portal/actions/workflows/ci.yml/badge.svg)](https://github.com/bmi-edu/ums-portal/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000.svg)](https://expressjs.com/)

An enterprise-grade, multi-portal Management System engineered for **Bethel Ministries International (BMI)**. Designed with role-based access control (RBAC), lifetime student UID generation, fee invoice processing, academic transcript tracking, and administrative governance workflows.

---

## Architecture Overview

```
                        ┌──────────────────────────────────────────┐
                        │              React 19 SPA                │
                        │ ├── Student Portal (10 Views)           │
                        │ └── Staff/Admin Portal (12 Role Views)  │
                        └───────────────────┬──────────────────────┘
                                            │ HTTP / REST APIs
                        ┌───────────────────▼──────────────────────┐
                        │          Express Server + Vite           │
                        │ ├── HMAC Token Auth & Passcode Guard     │
                        │ ├── Strict Role Authorization            │
                        │ └── Mass Assignment Sanitation           │
                        └───────────────────┬──────────────────────┘
                                            │ Non-blocking Async I/O
                        ┌───────────────────▼──────────────────────┐
                        │       Atomic JSON Engine / Prisma DB     │
                        │ ├── data/db.json (Runtime state)         │
                        │ └── prisma/schema.prisma (Postgres spec) │
                        └──────────────────────────────────────────┘
```

---

## Key Features & Capabilities

- **Immutable Student Identification**: Generates Base36 Lifetime Student UIDs (`BMI00002T`) and Career-Scoped Registration Numbers (`BMI/UG-CS/226/001`).
- **Role-Based Access Control (RBAC)**: Fine-grained access layers across 12 institutional roles including `President`, `Registrar`, `Admissions`, `Finance Officer`, `Lecturer`, `IT Admin`, `Auditor`, and `Student`.
- **Hardened Authentication**: HMAC SHA-256 JWT validation, timing-safe passcode checks, sanitized error responses, and mass-assignment filtering.
- **Automated Admissions Pipeline**: Converts verified student applications into matriculated student profiles with fee invoice issuance and course registration.
- **Academic & Financial Management**: Grade recording, GPA/CGPA computation, financial hold enforcement, fee payment processing, and library loan tracking.

---

## Security Specifications

1. **HMAC SHA-256 Signature Validation**: Tokens undergo strict cryptographic signature and expiry validation before route access is granted. Unsigned or tampered tokens are rejected.
2. **Mass Assignment Filtering**: API routes explicitly white-list updated properties on entities like `Student`, prohibiting unintended field overwrites (e.g. `id`, `studentUid`, `internalSeq`).
3. **Cryptographically Secure Identifiers**: Uses Node `crypto.randomInt` and `crypto.randomUUID` instead of pseudo-random generators for security-sensitive fields.
4. **CORS & Response Headers**: Enforces strict origin matching, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and `Referrer-Policy: strict-origin-when-cross-origin`.

---

## API Quick Reference

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates user role and issues HMAC token |
| `GET` | `/api/students` | `authMiddleware` | Retrieves student roster |
| `PUT` | `/api/students/:id` | `authMiddleware` | Updates student details with property sanitization |
| `POST` | `/api/applications` | Public | Submits a new student admission application |
| `POST` | `/api/applications/:id/convert` | `admissions`, `registrar` | Converts application to active student record |
| `POST` | `/api/applications/:id/pipeline` | `admissions`, `registrar` | Runs automated admission, fee invoice & enrollment pipeline |
| `PUT` | `/api/invoices/:id` | `finance`, `registrar` | Updates fee invoice details and processes payments |
| `GET` | `/api/audit-logs` | `it_admin`, `president` | Fetches administrative audit logs |
| `GET` | `/api/admin/neon-status` | `it_admin`, `president` | Returns Neon database cluster health metrics |

---

## Local Development & Setup

### Requirements
- Node.js 20+
- npm 10+

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Provide a secure secret key:
```env
JWT_SECRET=your_custom_jwt_secret_key_here
UMS_PASSCODE=123456
```

### Step 3: Run Development Server
```bash
npm run dev
```
The application will start on `http://localhost:3000`.

### Step 4: Run Tests & Type Checks
```bash
npm run lint    # Typecheck with TypeScript strict mode
npm run test    # Run Vitest test suite
```

---

## License & Copyright

© 2026 Bethel Ministries International (BMI). All Rights Reserved.
