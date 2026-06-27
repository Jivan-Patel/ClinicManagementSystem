# Clinic Management System (CMS) - Implementation Plan

This document outlines the step-by-step, phase-wise implementation plan for the multi-tenant Clinic Management System (CMS).

## Phase 1: Project Setup and Architecture
**Goal:** Initialize the project repositories, establish the folder structures, and configure the core technologies.

**Backend Tasks:**
- Initialize Node.js project.
- Install core dependencies (Express, Mongoose, dotenv, cors, helmet, morgan).
- Setup scalable folder structure (`config/`, `controllers/`, `middleware/`, `models/`, `routes/`, `services/`, `validators/`, `utils/`, `constants/`).
- Configure MongoDB Atlas connection using Mongoose.
- Setup global error handler and 404 middleware.
- Configure linters (ESLint, Prettier).

**Frontend Tasks:**
- Initialize React 19 project using Vite.
- Install core dependencies (React Router DOM, Tailwind CSS v4, Axios, React Hook Form, Zod, TanStack Query, React Hot Toast, Lucide React).
- Setup scalable folder structure (`api/`, `assets/`, `components/`, `layout/`, `pages/`, `hooks/`, `context/`, `utils/`, `types/`).
- Configure Tailwind CSS.
- Setup Axios instance with base API URL.

## Phase 2: Authentication (Doctor)
**Goal:** Implement a secure authentication system allowing doctors to register and log in to their isolated tenants.

**Backend Tasks:**
- Create `Doctor` Mongoose model with schema validation and indexes.
- Implement Zod validation schemas for signup and login requests.
- Create Auth Service and Auth Controller.
- Implement `/api/auth/signup` endpoint (Hash passwords with `bcrypt`).
- Implement `/api/auth/login` endpoint (Generate and return JWT).
- Implement `/api/auth/profile` endpoint.
- Create JWT authentication middleware to protect private routes.

**Frontend Tasks:**
- Create Authentication Context and custom hooks (`useAuth`).
- Build Signup Page UI with `react-hook-form` and `zod` validation.
- Build Login Page UI.
- Implement Axios interceptors to attach JWT to headers and handle 401 Unauthorized responses.
- Implement Protected Routes to restrict access to authenticated doctors.
- Implement Logout functionality.

## Phase 3: Dashboard Layout and Overview
**Goal:** Build the core application layout and the main dashboard displaying key metrics.

**Backend Tasks:**
- Implement `/api/dashboard` endpoint.
- Write MongoDB aggregation queries to fetch:
  - Total Patients (filtered by `doctorId`).
  - Today's Visits (filtered by `doctorId` and current date).
  - New Patients This Month.
  - Returning Patients Today.
- Fetch Recent Patients and Recent Visits lists.

**Frontend Tasks:**
- Build Main Layout component with responsive Sidebar navigation and Top Header.
- Build Dashboard Page UI.
- Fetch and display statistics using `TanStack Query`.
- Create reusable Card, Table, and Statistic components.
- Implement loading skeletons for data fetching states.

## Phase 4: Patient Management
**Goal:** Allow doctors to manage their patient records securely.

**Backend Tasks:**
- Create `Patient` Mongoose model (linked to `doctorId`).
- Implement CRUD Controllers & Routes:
  - `POST /api/patients` (Create)
  - `GET /api/patients` (List with pagination)
  - `GET /api/patients/:id` (Get single)
  - `PUT /api/patients/:id` (Update)
- Implement `/api/patients/search` endpoint (optimized with indexes for Name, Mobile, Patient ID).
- Implement logical deletion:
  - `PATCH /api/patients/archive/:id`
  - `PATCH /api/patients/restore/:id`
- Add comprehensive Zod validations.

**Frontend Tasks:**
- Build Patients List Page with search, filter, and pagination functionalities.
- Implement debounced global search dropdown in the header.
- Build Add/Edit Patient Form (handling new patient registration).
- Build Patient Details Page displaying patient information.
- Implement logic for Archiving and Restoring patients with confirmation dialogs.

## Phase 5: Visit Management
**Goal:** Enable tracking of patient visits, diagnoses, and treatments.

**Backend Tasks:**
- Create `Visit` Mongoose model (linked to `doctorId` and `patientId`).
- Implement CRUD Controllers & Routes:
  - `POST /api/visits` (Create new visit)
  - `GET /api/patients/:id/visits` (List visits for a specific patient)
  - `PUT /api/visits/:id` (Update)
  - `DELETE /api/visits/:id` (Delete)
- Add Zod validations for visit inputs.

**Frontend Tasks:**
- Add Visit History Section to the Patient Details Page.
- Build form to add a new visit (Diagnosis, Treatment).
- Implement the "Search -> Select -> Add Diagnosis -> Save as New Visit" workflow.
- Ensure that updating a patient's current status always creates a *new* visit record rather than overwriting past ones.

## Phase 6: Reports & Excel Export
**Goal:** Provide data export capabilities for clinic analytics and reporting.

**Backend Tasks:**
- Implement `/api/reports/export` endpoint.
- Create a service to handle date range filtering based on query parameters (`currentWeek`, `currentMonth`, `currentFY`, `custom`).
- Integrate `exceljs` library.
- Generate multi-sheet Excel workbooks:
  - Worksheet 1: Patient Visit Records (detailed rows).
  - Worksheet 2: Summary (aggregated metrics).
- Set appropriate response headers for file download.

**Frontend Tasks:**
- Build Reports Page UI.
- Implement filter controls (Dropdown for predefined ranges, Date pickers for custom range).
- Display summary metrics for the selected period before download.
- Implement download handler to receive blob from API and trigger browser download.

## Phase 7: Settings
**Goal:** Allow doctors to customize their clinic profile and preferences.

**Backend Tasks:**
- Create endpoints to retrieve and update Doctor settings.

**Frontend Tasks:**
- Build Settings Page UI.
- Create forms to update Clinic Name, Doctor Name, Phone, Address, Consultation Fee, and Prescription Footer.
- Integrate toast notifications on successful updates.

## Phase 8: Testing and Quality Assurance
**Goal:** Ensure application stability and correctness before deployment.

**Tasks:**
- Conduct thorough manual testing of all user flows.
- Verify multi-tenant isolation (ensure Doctor A cannot see Doctor B's data).
- Test edge cases (invalid inputs, network failures, expired tokens).
- Verify responsiveness on mobile, tablet, and desktop views.
- Test Excel export accuracy.

## Phase 9: Deployment
**Goal:** Make the application live and accessible.

**Backend Deployment:**
- Configure environment variables for production.
- Deploy Node.js server to Render or Railway.
- Ensure CORS is configured to accept requests only from the production frontend domain.

**Database:**
- Setup MongoDB Atlas production cluster.
- Configure IP Access List.
- Verify database indexes are applied.

**Frontend Deployment:**
- Configure environment variables (`VITE_API_BASE_URL`).
- Deploy React application to Vercel.
- Verify build process and routing in the production environment.
