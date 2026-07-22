# Tadrebk

<p align="center">
  <strong>Bridging Egypt's brightest university students with the future of work.</strong>
</p>

<p align="center">
  <a href="https://tadrebk.vercel.app">Live Demo</a> ·
  <a href="https://tadreebak-e285.onbelmo.uk/api/v1/docs/swagger-ui-init.js">API Docs</a> ·
  <a href="https://github.com/Ziad-AboElenien/tadrebk/issues">Report Bug</a>
</p>

---

## About

**Tadrebk** is a full-stack internship platform built to connect talented university students in Egypt with forward-thinking companies. Students can browse and apply to internships, track their applications, and receive completion certificates. Companies can post internships, manage applicants, and communicate with candidates — all from a single platform.

### Key Features

**For Students:**
- Browse and search internships by category, location, working time, and skills
- Apply with cover letter, resume, and answers to custom questions
- Track application status in real-time (pending → accepted → completed)
- Receive acceptance emails and download completion certificates
- Build a professional profile with education, experience, and skills

**For Companies:**
- Post internships with custom MCQ and writing questions
- Review and manage applicants (accept, reject, complete)
- Send acceptance emails and view applicant profiles
- Upload company branding (logo, cover image)
- Manage billing plans and internship credits via Paymob integration

**For Admins:**
- Approve or ban companies
- View all registered companies with filtering

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| State | Redux Toolkit |
| Forms | React Hook Form + Zod |
| Auth | JWT (localStorage + cookies), Google OAuth |
| HTTP | Axios (auto-refresh on 401) |
| Icons | FontAwesome |
| Payments | Paymob |
| Language | TypeScript |
| Deployment | Vercel (frontend), Custom Node.js API (backend) |

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/Ziad-AboElenien/tadrebk.git
cd tadrebk

# Install dependencies
npm install

# Set up environment variables
cp src/config/.env .env.local
# Edit .env.local with your API base URL

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:3000/api/v1` |

---

## How It Works

1. **Students** sign up, complete their profile, and browse available internships
2. **Companies** register, get approved by admin, and post internship opportunities
3. Students apply to internships with their resume and answers to custom questions
4. Companies review applications, accept or reject candidates, and send acceptance emails
5. After the internship is completed, companies mark it as done and students receive a certificate

---

## Project Structure

```
src/
├── app/                    # Next.js App Router (route groups: public, auth, student, company, admin)
├── components/             # Shared UI components, layout, and session management
├── features/               # Feature-based modules
│   ├── auth/               # Authentication (login, signup, OTP, Google OAuth)
│   ├── student/            # Student dashboard, profile, applications, certificate
│   ├── company/            # Company dashboard, internships, applicant management
│   ├── internship/         # Internship listing, details, search, and filters
│   ├── billing/            # Billing plans, Paymob payment integration
│   ├── notifications/      # Real-time notifications system
│   ├── admin/              # Admin dashboard for company approval
│   └── home/               # Homepage and about page
├── services/               # (Empty - services are in feature folders)
├── store/                  # Redux slices (auth, user, company, internship)
├── lib/                    # Axios instance, constants, file proxy
└── proxy.ts                # Next.js middleware for route protection
```

---

## Team

| Name | Role | 
|------|------|
| Ziad Elsayed | Frontend Developer & CEO |
| Ammar Sobhi | Frontend Developer & CTO |
| Emad Abd Elaaty | UI/UX & Frontend Developer & CDO |
| Aly Khalid | Backend Developer |
| Mostafa Rafat | Full Stack Developer |
| Khaled Manaa | Backend Developer |

---

## License

This project was built as a graduation project for DEPI (Digital Egypt Pioneers Initiative).

---

## 2. Project Structure

```
src/
├── app/                          # Next.js App Router (thin page wrappers)
│   ├── (public)/                 # Public routes
│   │   ├── page.tsx              # Home page
│   │   ├── layout.tsx            # Public layout (Navbar + Footer)
│   │   ├── internships/          # Internship listing + details
│   │   ├── companies/            # Company listing + details
│   │   ├── how-it-works/         # Static info page
│   │   └── about/                # About page
│   ├── (auth)/                   # Auth routes
│   │   ├── login/student, login/company
│   │   ├── signup/student, signup/company
│   │   ├── confirm-email/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   └── get-started/          # Landing/CTA page
│   ├── (student)/                # Student routes
│   │   ├── dashboard/
│   │   ├── profile/
│   │   ├── my-applications/
│   │   ├── notifications/
│   │   ├── change-password/
│   │   └── change-email/
│   ├── (company)/                # Company routes
│   │   ├── company/dashboard/
│   │   ├── company/onboarding/
│   │   ├── company/post-internship/
│   │   ├── company/billing/      # Billing plans + callback
│   │   ├── company/internships/[internId]/edit
│   │   ├── company/internships/[internId]/applications
│   │   ├── company/applicants/[userId]
│   │   ├── company/profile/
│   │   ├── company/settings/
│   │   └── company/change-password, company/change-email
│   ├── (admin)/                   # Admin routes
│   │   └── admin/dashboard/
│   ├── certificate/               # Certificate page (query params: name, internshipId)
│   ├── layout.tsx                 # Root layout (Inter font, globals.css, Providers)
│   ├── providers.tsx              # Redux Provider + SessionLoader + ToastContainer
│   └── globals.css                # Tailwind v4 entry + design tokens
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx             # Sticky navbar, role-based links, user menu dropdown
│   │   └── Footer.tsx             # Server component, 5-column grid
│   ├── shared/
│   │   ├── SessionLoader.tsx      # Hydrates Redux from API on hard refresh
│   │   └── FilterSidebar.tsx      # Sidebar filter for internship listing
│   └── ui/                        # 15 reusable components
│       ├── Button.tsx             # forwardRef, 5 variants, 3 sizes, loading state
│       ├── Input.tsx              # forwardRef, label, error, hint, leftIcon, rightElement
│       ├── Select.tsx             # Custom dropdown, options array OR children <option>
│       ├── Badge.tsx              # 6 variants (primary/success/warning/info/neutral/danger)
│       ├── Avatar.tsx             # Image or gradient initials fallback
│       ├── Spinner.tsx            # CSS animated spinner, 3 sizes
│       ├── Pagination.tsx         # Smart ellipsis, max 7 buttons
│       ├── EmptyState.tsx         # Centered placeholder with icon + title + action
│       ├── ConfirmModal.tsx       # Modal with backdrop blur, Escape key close
│       ├── ApplyModal.tsx         # Application form with cover letter + answers
│       ├── ImageLightbox.tsx      # Full-screen image lightbox modal
│       ├── OTPInput.tsx           # 6-digit code, auto-advance, paste support
│       ├── InternshipCard.tsx     # Compact and full detail modes
│       ├── CompanyCard.tsx        # Gradient avatar, industry, stats
│       └── ComingSoonCard.tsx     # Dashed border placeholder
│
├── features/
│   ├── auth/
│   │   ├── components/            # LoginForm, SignupForm, ChangePasswordForm, ChangeEmailForm
│   │   ├── schemas/auth.schemas.ts # ALL Zod schemas (signup, login, profile, internship, etc.)
│   │   ├── hooks/useGoogleAuth.ts  # Google Identity Services integration
│   │   ├── server/auth.service.ts  # Auth API calls (separate axios instance)
│   │   ├── store/                  # Auth-related Redux logic
│   │   └── types/index.ts          # UserRole, AuthTokens, etc.
│   ├── home/                       # Homepage + About page
│   │   ├── screens/
│   │   │   ├── home.tsx            # Full homepage component
│   │   │   └── about.screen.tsx    # About page with team cards
│   │   ├── components/
│   │   ├── server/
│   │   └── types/
│   ├── internship/
│   │   ├── types/index.ts          # Internship, MCQQuestion, WritingQuestion, etc.
│   │   ├── server/                 # Internship server utilities
│   │   ├── components/             # Internship-specific components
│   │   └── screens/
│   │       ├── internships-listing.screen.tsx
│   │       ├── internship-details.screen.tsx
│   │       ├── post-internship.screen.tsx
│   │       └── edit-internship.screen.tsx
│   ├── student/
│   │   ├── types/index.ts          # User type with profile fields
│   │   ├── server/                 # Student server utilities
│   │   ├── components/             # Student-specific components
│   │   └── screens/
│   │       ├── dashboard.screen.tsx
│   │       ├── profile.screen.tsx
│   │       ├── my-applications.screen.tsx
│   │       └── certificate.screen.tsx
│   ├── company/
│   │   ├── types/index.ts          # Company type
│   │   ├── server/                 # Company server utilities
│   │   ├── components/             # Company-specific components
│   │   └── screens/
│   │       ├── dashboard.screen.tsx
│   │       ├── onboarding.screen.tsx
│   │       ├── companies-listing.screen.tsx
│   │       ├── company-details.screen.tsx
│   │       ├── internship-applications.screen.tsx
│   │       └── company-settings.screen.tsx
│   ├── billing/                    # Billing feature
│   │   ├── screens/
│   │   │   ├── plans.screen.tsx
│   │   │   └── payment-callback.screen.tsx
│   │   └── types/                  # Plan types
│   ├── notifications/             # Notifications feature
│   │   ├── components/
│   │   │   └── NotificationBell.tsx
│   │   ├── screens/
│   │   │   └── notifications.screen.tsx
│   │   ├── server/
│   │   └── types/
│   └── admin/                      # Admin feature
│       ├── screens/
│       │   └── admin-dashboard.screen.tsx
│       ├── components/
│       ├── server/
│       └── types/
│
├── services/                      # API service modules (axios-based)
│   ├── user.service.ts            # User CRUD + file uploads (profile/cover/resume)
│   ├── internship.service.ts      # Internship CRUD + listing + filtering
│   ├── company.service.ts         # Company CRUD + file uploads (logo/cover)
│   ├── application.service.ts     # Application CRUD + review + cancel + complete + email
│   └── admin.service.ts           # Company approval/ban management
│
├── store/
│   ├── store.ts                   # configureStore + typed hooks
│   ├── authSlice.ts               # Auth state (tokens, role, userId), localStorage + cookie sync
│   ├── userSlice.ts               # Current user profile (includes updateUser action)
│   ├── companySlice.ts            # Current company profile
│   └── internshipSlice.ts         # Internship list, filters, pagination
│
├── lib/
│   ├── axios.ts                   # Axios instance, interceptors, error helpers
│   ├── constants.ts               # LocalStorage keys, enums, config
│   └── file-proxy.ts              # File proxy URL construction
│
├── assets/
│   └── images/                    # Static images (team photos, logo)
│
└── proxy.ts                       # Next.js middleware (route protection via cookies)
```

### Page Routes
- `(public)`: `/`, `/internships`, `/internships/[id]`, `/companies`, `/companies/[id]`, `/how-it-works`, `/about`
- `(auth)`: `/login/student`, `/login/company`, `/signup/student`, `/signup/company`, `/confirm-email`, `/forgot-password`, `/reset-password`, `/get-started`
- `(student)`: `/dashboard`, `/profile`, `/my-applications`, `/notifications`, `/change-password`, `/change-email`
- `(company)`: `/company/dashboard`, `/company/onboarding`, `/company/post-internship`, `/company/billing`, `/company/billing/plans`, `/company/billing/callback`, `/company/internships/[id]/edit`, `/company/internships/[id]/applications`, `/company/applicants/[id]`, `/company/profile`, `/company/settings`, `/company/change-password`, `/company/change-email`
- `(admin)`: `/admin/dashboard`
- `certificate`: `/certificate` (query params: `name`, `internshipId`)

### Screen Pattern
Every page in `app/` is a thin wrapper (5-25 lines) that imports and renders a Screen component from `features/{domain}/screens/`. Example:
```tsx
// src/app/(public)/page.tsx
import HomeComponent from "@/features/home/screens/home";
export default function HomePage() { return <HomeComponent />; }
```

---

## 3. Authentication & Authorization

### 3.1 Signup Flow
1. Form submits to `authService.signup()` → `POST /auth/signup` with `{ firstName, lastName, email, password, confirmPassword, phone? }`
2. **No role field is sent** — role is purely a frontend concept
3. Pending email stored in localStorage (`LS_PENDING_EMAIL`) for OTP confirmation
4. Redirect to `/confirm-email`

### 3.2 Login Flow
1. `authService.login()` → `POST /auth/login` → receives `{ data: { tokens: { accessToken, refreshToken } } }` (⚠️ NO `user` field in login response)
2. JWT access token is parsed client-side via `parseJwt()` (base64 decode) to extract `id` and `exp`
3. Full user profile fetched: `userService.getUserProfile(userId)` → `GET /user/{userId}`
4. **Role detection** (frontend-only, API has no role field):
   - If JWT has `role === 'admin'` OR user profile has `role === 'admin'` → admin
   - Otherwise, fetch all companies (`companyService.listCompanies()`) and check if any `createdBy` matches userId → company
   - Otherwise → student
5. `dispatch(setTokens(...))` writes tokens + userId + role to Redux AND localStorage AND cookies
6. Redirect to role-appropriate dashboard

### 3.3 Google Auth
1. `useGoogleAuth` hook dynamically loads Google Identity Services script
2. `signInWithGoogle()` → `google.accounts.id.initialize()` + `google.accounts.id.prompt()`
3. Callback receives credential (ID token) → `authService.googleAuth({ idToken })` → `POST /auth/google`
4. Same token format + role detection as email login

### 3.4 JWT Token Refresh (Axios Interceptor)
- **Request interceptor**: reads `accessToken` from localStorage, attaches `Authorization: Bearer {token}`
- **Response interceptor**: on 401:
  1. Set `_retry = true` to prevent infinite loop
  2. Read `refreshToken` from localStorage
  3. `POST /auth/refresh` with `{ refreshToken }`
  4. On success: store new tokens, retry original request
  5. On failure: clear auth storage, redirect to `/login/student`
- **Token TTL**: 86400000ms (1 day), checked via `LS_TOKEN_TIMESTAMP` in `loadFromStorage()`

### 3.5 Redux Auth Slice (`authSlice.ts`)
- `deriveRole()`: reads from localStorage, falls back to `LS_COMPANY_ID` check
- `setTokens()`: persists to localStorage + cookies (for middleware)
- `setRole()`: updates role in Redux + localStorage + cookie
- `logout()`: clears ALL auth state, localStorage keys, expires cookies

### 3.6 Middleware (`proxy.ts`)
- Reads `accessToken` and `userRole` from **cookies**
- Route categories: `STUDENT_ROUTES`, `COMPANY_ROUTES`, `ADMIN_ROUTES`, `AUTH_ROUTES`
- Authenticated users redirected away from auth pages to their dashboard
- Student routes: require auth; admin redirected to `/admin/dashboard`
- Company routes: require auth
- Admin routes: require auth + `role === 'admin'`
- Matcher excludes static files

### 3.7 Session Hydration (`SessionLoader`)
- On mount, if tokens exist but Redux user/company is null (after hard refresh):
  - Fetch user profile from API
  - Detect admin role from JWT or profile
  - Detect company role by checking `createdBy` match
  - Dispatch to Redux

---

## 4. Student Features

### 4.1 Dashboard (`/dashboard`)
- **Profile summary card**: gradient cover, avatar, name, education, major, graduation year, email
- **Stats row**: Total Applied count, Resume status (✓ or —), Saved Roles count
- **Email confirmation banner**: If `user.isConfirmed === false`, shows amber banner with "Verify Now" link to `/confirm-email`
- **My Applications section**:
  - Fetched via `applicationService.getUserApplications(userId, { page, limit, status? })` → `GET /user/{userId}/applications`
  - **Status filter tabs**: All / Pending / Accepted / Rejected — each tab is a clickable card with count
  - Each application shows: title (link to internship), company name + logo, location, working time, status Badge, Cancel button (for pending only), cover letter preview, resume link, applied date
  - Pagination via `<Pagination>` component
  - Cancel: `applicationService.cancelApplication()` → `DELETE /company/{companyId}/internships/{internId}/applications/{applicationId}`
- **Saved Internships section**: localStorage key `tadrebk_saved_internships` (array of IDs), fetched via `getInternshipById()` for each saved ID
  - Displayed as cards with title, company, location, working time
- **Resume upload**: `<input type="file">` → `userService.uploadResume(file)` → `POST /user/upload/resume` (multipart)

### 4.2 Profile (`/profile`)
- **View mode**: Cover image (clickable → lightbox), avatar, name, headline, bio, skills (pills), experience timeline, education timeline, contact info
- **Edit mode** (toggle via `editing` state):
  - Uses `react-hook-form` + Zod `profileSchema`
  - Fields: firstName, lastName, headline, bio (textarea), phone, gender (Select), address, dateOfBirth, skills (comma-separated string → split to array on submit)
  - Experience & Education: dynamic arrays via `useFieldArray` — add/remove entries
  - On submit: `userService.updateProfile(userId, payload)` → `PATCH /user/{userId}`
  - Dispatch `setUser(updated)` to Redux
- **File uploads** (3 separate flows, identical pattern):
  - **Profile picture**: `<input type="file">` → `uploadProfilePicture(file)` → `POST /user/upload/profilePicture` → returns URL → `updateProfile({ profilePicture: url })` → dispatch `updateUser()`
  - **Cover picture**: Same pattern via `/user/upload/coverPicture`
  - **Resume**: `uploadResume(file)` → `POST /user/upload/resume` → `updateProfile({ resume: url })` → dispatch `updateUser()`
- **Account Settings section**: links to `/change-password`, `/change-email`
- **Delete Account**: confirm-then-delete flow — `userService.deleteAccount(userId)` → clears Redux (both `clearUser` + `logout`) → redirect `/`

### 4.3 My Applications (`/my-applications`)
- Standalone page (separate from dashboard)
- Same status filter tabs: All / Pending / Accepted / Rejected with count cards
- Each application: internship title (link), applied date, status Badge, "View Internship" link, cover letter preview (2-line clamp)
- **Certificate button**: shown only when `status === 'accepted' && completed === true` — links to `/certificate?name=...&internshipId=...`
- Pagination with Previous/Next buttons

### 4.4 Applying to Internships
Triggered from Internship Details page (`/internships/[internId]`):
1. Fetches internship via `internshipService.getInternshipById(internId)` → `GET /internships/{internId}`
2. Company data extracted from populated `companyId` object
3. Related internships from same company
4. **Already-applied check**: `getUserApplications(userId)` — checks if any app matches this internship
5. **Save/Unsave**: localStorage `tadrebk_saved_internships` (array of IDs)
6. **ApplyModal** opens:
   - **Cover letter** textarea with character count
   - **Resume upload**: file input for PDF
   - **Answers section**: If the internship has `questions` array:
     - MCQ questions → radio buttons for each option
     - Writing questions → textarea
   - On submit: `applicationService.apply(companyId, internId, payload)`
     - Payload is `FormData` with:
       - `coverLetter`: string
       - `resume`: File (binary)
       - `answers`: JSON stringified array of `{ type: 'mcq', selectedOption: string }` or `{ type: 'writing', text: string }`
     - `POST /company/{companyId}/internships/{internId}/applications` (multipart/form-data)
7. Error handling: different messages for "already applied", "resume/CV required", "closed", "invalid internship id"

### 4.5 Resume Upload Fix (Critical)
The resume upload flow was fixed to properly persist to backend AND Redux:
- **BEFORE**: Upload was local state only — not sent to API
- **AFTER**: `handleResumeUpload` calls `uploadResume(file)` → gets URL → calls `updateProfile(userId, { resume: url })` → dispatches `updateUser()` to Redux
- Same fix applied to profile picture and cover picture uploads

---

## 5. Company Features

### 5.1 Company Dashboard (`/company/dashboard`)
- Company info header: name, industry, email, approval badge
- **Pending approval banner**: if `!company.approvedByAdmin`, shows amber warning
- **Stats row**: Total internships, Active count, Closed count
- **Internships list** with tabs: Active / Closed
  - Fetched via `internshipService.listInternships({ companyId, limit: 100 })` → `GET /internships?companyId=...`
  - Filtered client-side by `closed` field
  - Each row has: title, description, location, working time, skills, applicant count link, action buttons:
    - **Applicants**: link to `/company/internships/[internId]/applications`
    - **Edit**: link to `/company/internships/[internId]/edit`
    - **Toggle status**: `updateInternship(companyId, internId, { closed: !intern.closed })`
    - **Delete**: `deleteInternship(companyId, internId)` with confirmation
- If no company exists, prompts user to complete onboarding

### 5.2 Company Onboarding (`/company/onboarding`)
- "Step 2 of 2" after signup
- `react-hook-form` + Zod `companyOnboardingSchema`
- Fields: name, description (textarea), industry (Select), address, numberOfEmployees, companyEmail, legalAttachment (file)
- On submit: creates `FormData` with all text fields + legal document → `POST /company/` (multipart)
- On success: `dispatch(setCompany(company))` + `dispatch(setRole('company'))` → redirect to dashboard
- `setCompany` writes `LS_COMPANY_ID` to localStorage

### 5.3 Post Internship (`/company/post-internship`)
- `react-hook-form` + Zod `internshipSchema`
- Fields: title, description (textarea), location (Select: on-site/remote/hybrid), workingTime (Select: full-time/part-time)
- **Skills**: comma-separated strings in local state → split to arrays on submit
- **Questions builder**: Dynamic MCQ + Writing questions:
  - MCQ: prompt + dynamic options list (add/remove options)
  - Writing: prompt only
  - Questions are typed as `InternshipQuestion[]` (discriminated union via `type` field)
- **Pre-knowledge to Start**: comma-separated textarea → split to array on submit
- On submit: `internshipService.createInternship(companyId, payload)` → `POST /company/{companyId}/internships`

### 5.4 Edit Internship (`/company/internships/[internId]/edit`)
- Fetches existing internship via `getInternshipById(internId)` → `GET /internships/{internId}`
- Pre-populates form with `reset()`:
  - Skills arrays joined back to comma-separated strings
  - Questions loaded into state
  - preKnowledge array joined back to comma-separated string
- On submit: `internshipService.updateInternship(companyId, internId, payload)` → `PUT /company/{companyId}/internships/{internId}`

### 5.5 Applications Management (`/company/internships/[internId]/applications`)
- Fetches internship + applications in parallel via `Promise.all()`
- `applicationService.getCompanyApplications(companyId, internId, { limit: 100 })` → `GET /company/{companyId}/internships/{internId}/applications`
- **Pre-knowledge display**: shows preKnowledge items as bulleted list in amber box
- **Filter tabs**: All / Pending / Accepted / Rejected with count cards
- Each applicant shows: avatar (image or gradient initials), name (link to profile), email, status Badge
- **Review actions**:
  - Accept: `reviewApplication() with { status: 'accepted' }` → `PATCH /company/{companyId}/internships/{internId}/applications/{appId}`
  - Reject: Same endpoint with `{ status: 'rejected' }`
  - **Bug fix**: `handleReview` preserves original `studentId`, `internshipId`, `companyId` from old application because API review response may return them as plain IDs (not populated)
  - **Complete**: `completeApplication()` → `PATCH /company/{companyId}/internships/{internId}/applications/{applicationId}/complete` — marks an accepted application as completed, shown as "Complete" button for accepted apps, turns into "Completed" badge after success. Only completed applications show the Certificate button to students.
- **Send Email** (for accepted applications): `POST /company/{companyId}/internships/{internId}/applications/{applicationId}/send-acceptance-email` — no request body
- **"Send Email to All"**: loops through all accepted applications, sends emails, shows success/failure counts
- **Application CV**: shows download link for `app.resume.secure_url` via file proxy
- **Answers display**: shows each applicant's answers to internship questions

### 5.6 Company Profile/Settings (`/company/settings`)
- **Branding section**: Logo upload + cover image upload
  - `companyService.uploadLogo(companyId, file)` → `POST /company/{companyId}/logo` (multipart)
  - `companyService.uploadCoverPicture(companyId, file)` → `POST /company/{companyId}/coverPicture` (multipart)
- **Company details form**: `react-hook-form` + Zod `companySettingsSchema`
  - Fields: name, description (textarea), industry (Select), address, companyEmail, numberOfEmployees
  - Pre-populated via `reset()` on mount
  - On submit: `companyService.updateCompany(companyId, data)` → `PATCH /company/{companyId}` → dispatch `setCompany(updated)`
- **Account section**: links to `/company/change-password`, `/company/change-email`

### 5.7 Applicant Detail View (`/company/applicants/[userId]`)
- Fetches user profile: `userService.getUserProfile(userId)` → `GET /user/{userId}`
- Read-only view: cover image, avatar, name, email, phone, headline, bio, skills, experience, education, resume link
- Companies evaluate applicants without leaving the platform

### 5.8 Companies Listing + Details
- **Listing** (`/companies`): grid of company cards with logo/initials, name, industry, employee count, internship count, address, pending badge
- **Industry filter**: custom Select with options prop
- **Details** (`/companies/[companyId]`): company info + internships list
  - **Bug fix**: hooks order error fixed — `logoError` state moved above early returns; replaced `useState(() => getImgUrl(...))` with plain variable to avoid hooks-after-return issue

---

## 6. Admin Features

### 6.1 Admin Dashboard (`/admin/dashboard`)
- **Role guard**: if `role !== 'admin'`, displays "You do not have admin access"
- **Tab system**: Pending / Approved / All
  - **Pending tab**: `adminService.getPendingCompanies(page, 20)` → `GET /company/admin/pending`
  - **Approved tab**: `adminService.getAllCompanies(page, 50, true)` → `GET /company/` with `approvedByAdmin=true`
  - **All tab**: merges pending + approved using a Map
- **Company list**: name, industry, email, creation date, status badge
- **Pending companies**: Approve button (`PATCH /company/admin/{companyId}/approve`) + Ban button (`PATCH /company/admin/{companyId}/ban` with ConfirmModal)
- **Approved companies**: Ban button (with Unban: `PATCH /company/admin/{companyId}/unban`)
- **All tab**: status badges only (no actions)
- Pagination via `<Pagination>` component

---

## 7. Internship Data Model (API Schema)

From Swagger:

### Internship Object
```json
{
  "_id": "string",
  "title": "string",
  "description": "string",
  "location": "on-site | remote | hybrid",
  "workingTime": "full-time | part-time",
  "softSkills": ["string"],
  "technicalSkills": ["string"],
  "companyId": "string",
  "addedBy": "string",
  "updatedBy": "string",
  "closed": false,
  "createdAt": "date",
  "updatedAt": "date"
}
```
**Note**: `questions` and `preKnowledge` are accepted in POST/PUT request body but NOT returned in the GET response schema. Frontend types include them anyway since the DB may return them.

### Create Internship Request Body
```json
{
  "title": "string",
  "description": "string",
  "location": "on-site",
  "workingTime": "full-time",
  "softSkills": ["string"],
  "technicalSkills": ["string"],
  "questions": [
    { "type": "mcq", "prompt": "string", "options": ["string", "string"] },
    { "type": "writing", "prompt": "string" }
  ],
  "preKnowledge": ["string"]
}
```
**Note**: The API field name is `preKnowledge` (capital K, array of strings), NOT `preknowledgeToStart`. Frontend was initially sending wrong field name — now fixed.

### Application Object
```json
{
  "_id": "string",
  "studentId": { "_id": "string", "firstName": "string", "lastName": "string", "email": "string", "profilePicture": { "public_id": "string", "secure_url": "string" } },
  "internshipId": "string | { _id, title, location, workingTime }",
  "companyId": "string",
  "status": "pending | accepted | rejected",
  "completed": false,
  "coverLetter": "string?",
  "resume": { "public_id": "string", "secure_url": "string" }?,
  "answers": [{ "type": "mcq", "selectedOption": "string" } | { "type": "writing", "text": "string" }]?,
  "createdAt": "date",
  "updatedAt": "date",
  "reviewedBy": "string?"
}
```

### Key API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register |
| POST | `/auth/login` | Login (returns `{ data: { tokens: { accessToken, refreshToken } } }`) |
| POST | `/auth/google` | Google auth |
| POST | `/auth/refresh` | Refresh token |
| GET | `/user/{userId}` | Get user profile |
| PATCH | `/user/{userId}` | Update profile |
| POST | `/user/upload/resume` | Upload resume |
| POST | `/user/upload/profilePicture` | Upload profile picture |
| POST | `/user/upload/coverPicture` | Upload cover picture |
| DELETE | `/user/{userId}` | Delete account |
| POST | `/company/` | Create company (multipart) |
| PATCH | `/company/{companyId}` | Update company |
| POST | `/company/{companyId}/logo` | Upload logo |
| POST | `/company/{companyId}/coverPicture` | Upload cover picture |
| GET | `/company/admin/pending` | List pending (admin) |
| PATCH | `/company/admin/{id}/approve` | Approve company |
| PATCH | `/company/admin/{id}/ban` | Ban company |
| PATCH | `/company/admin/{id}/unban` | Unban company |
| GET | `/internships` | List internships (with filters) |
| GET | `/internships/{id}` | Get internship |
| POST | `/company/{companyId}/internships` | Create internship |
| PUT | `/company/{companyId}/internships/{id}` | Update internship |
| DELETE | `/company/{companyId}/internships/{id}` | Delete internship |
| POST | `/company/{companyId}/internships/{id}/applications` | Apply (multipart) |
| GET | `/company/{companyId}/internships/{id}/applications` | List applications |
| PATCH | `/company/{companyId}/internships/{id}/applications/{appId}` | Review (accept/reject) |
| DELETE | `/company/{companyId}/internships/{id}/applications/{appId}` | Cancel application |
| PATCH | `/company/{companyId}/internships/{id}/applications/{appId}/complete` | Mark application as completed |
| POST | `/company/{companyId}/internships/{id}/applications/{appId}/send-acceptance-email` | Send email |
| GET | `/user/{userId}/applications` | Get user's applications |
| POST | `/notifications` | Mark notification as read |

---

## 8. Form Patterns & Components

### 8.1 react-hook-form + Zod Integration
All forms follow this pattern:
```tsx
const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { ... },
});
```
- `zodResolver` from `@hookform/resolvers`
- `noValidate` disables browser validation
- Error messages passed via `errors.field?.message`
- All Zod schemas centralized in `src/features/auth/schemas/auth.schemas.ts`

### 8.2 Custom Select Component (`Select.tsx`)
Fully custom dropdown (NOT native `<select>`):
- Accepts `options` array OR native `<option>` children (backwards compatible)
- **⚠️ React 19 issue**: `child.type === 'option'` detection breaks in React 19 — must use `options` prop
- Outside click detection via `document.addEventListener('mousedown', handle)`
- Escape key closes dropdown
- Emits `onChange({ target: { value: item.value } })` — compatible with react-hook-form's `register().onChange`
- Shows checkmark on selected item
- Usage with react-hook-form:
  ```tsx
  // OLD (React 19 incompatible):
  <Select {...register('field')}><option value="a">A</option></Select>
  
  // NEW (must use):
  <Select value={watch('field')} onChange={(e) => setValue('field', e.target.value, { shouldValidate: true })} options={[{ value: 'a', label: 'A' }]} />
  ```

### 8.3 Questions Builder
Dynamic form for internship questions:
- Two types: MCQ (multiple choice with dynamic options) and Writing (free text)
- Each MCQ question: prompt input + list of option inputs (add/remove)
- Each Writing question: prompt input only
- Questions stored as `InternshipQuestion[]` state
- On submit: cleaned (empty MCQ options filtered out), sent as `questions` array in payload

### 8.4 File Uploads as FormData
All file uploads follow this pattern:
```tsx
const formData = new FormData();
formData.append('file', file);
api.post('/endpoint', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
```
- Returned URL is then saved to user/company profile via update API call
- Axios automatically sets `Content-Type` with boundary when FormData is detected
- Hidden `<input type="file">` triggered by button click via ref

### 8.5 OTP Input (`OTPInput.tsx`)
6-digit verification code input:
- 6 individual input boxes
- Auto-advance on typing, backspace to previous
- Arrow key navigation
- Paste support (strip non-digits)
- `useRef<(HTMLInputElement | null)[]>([])` for focus management

---

## 9. UI Component Library (14 Components)

| Component | Props | Key Features |
|-----------|-------|-------------|
| **Button** | variant (5), size (3), loading, fullWidth, leftIcon, rightIcon | forwardRef, loading spinner + text |
| **Input** | label, error, hint, leftIcon, rightElement | forwardRef, useId(), auto-ID generation |
| **Select** | options, value, onChange, label, error, hint, placeholder, children | Custom dropdown, outside click, Escape, checkmark |
| **Badge** | variant (6), size (2) | Rounded-full, uppercase, colored bg/text/border |
| **Avatar** | src, name, size (7), index | Image or gradient initials (6 gradient options) |
| **Spinner** | size (3) | CSS border-t-primary animate-spin, aria-label |
| **Pagination** | currentPage, totalPages, onPageChange | Ellipsis logic, prev/next, aria-current |
| **EmptyState** | icon (FontAwesome), title, description, action | Centered placeholder |
| **ConfirmModal** | open, title, message, confirmLabel, confirmVariant, loading, onConfirm, onCancel | Backdrop blur, Escape close |
| **ApplyModal** | open, internshipTitle, companyName, loading, onSubmit, onCancel | Cover letter textarea, char count |
| **OTPInput** | length (default 6), value, onChange, error, disabled | Auto-advance, paste, keyboard nav |
| **InternshipCard** | internship, compact | Two display modes |
| **CompanyCard** | company, internshipCount | Gradient avatar, industry, stats |
| **ComingSoonCard** | icon, title, description | Dashed border, amber badge |

---

## 10. State Management (Redux Toolkit)

### Store Configuration (`store.ts`)
```tsx
export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    company: companyReducer,
    internship: internshipReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

### Auth Slice
- **State**: accessToken, refreshToken, isAuthenticated, role (student/company/admin), userId, status, error
- **Persistence**: localStorage + cookies sync
- **Key actions**: `setTokens`, `setRole`, `logout`, `clearError`, `setStatus`, `setError`
- **Token expiry**: checked on app load via `LS_TOKEN_TIMESTAMP` + `TOKEN_TTL_MS` (1 day)

### User Slice
- **State**: currentUser (full profile object)
- **Key actions**: `setUser`, `updateUser` (partial update), `clearUser`
- **No localStorage fallback for images**: profile/cover pictures come exclusively from API response (removed old `LS_PROFILE_PICTURE`, `LS_COVER_PICTURE` keys)

### Company Slice
- **State**: currentCompany (full company object)
- **Key actions**: `setCompany`, `clearCompany`

### Internship Slice
- **State**: internships list, filters, pagination, selectedInternship

---

## 11. Critical Bugs Fixed & Recent Changes

### 11.1 Resume Upload Not Dispatching to Redux
- **Problem**: `handleResumeUpload` uploaded file to API but did NOT call `updateProfile()` to save URL to user record, and did NOT dispatch `updateUser()` to Redux
- **Fix**: Added `await userService.updateProfile(userId!, { resume: url })` + `dispatch(updateUser({ resume: url }))` in profile screen. Same fix applied to profile picture and cover picture.

### 11.2 My Applications Status Filter Tabs
- **Problem**: My Applications page had no filter tabs — all applications shown at once
- **Fix**: Added status filter tabs (All/Pending/Accepted/Rejected) with count cards, identical to dashboard style. Tabs send `status` param to API for server-side filtering.

### 11.3 Email Confirmation Banner
- **Problem**: Unconfirmed users had no visual reminder to verify email
- **Fix**: Added amber banner on student dashboard when `user.isConfirmed === false`, with "Verify Now" link to `/confirm-email`

### 11.4 Delete Account Functionality
- **Problem**: No way for students to delete their account
- **Fix**: Added "Delete Account" button in Profile → Account Settings with confirm-then-delete flow. Calls `userService.deleteAccount(userId)`, dispatches `clearUser()` + `logout()`, redirects to `/`.

### 11.5 Company Applications Missing CV Display
- **Problem**: The resume uploaded by the student during application was not displayed on the company side
- **Fix**: Added `app.resume?.secure_url` check rendering a downloadable "Application CV" button with file proxy URL

### 11.6 Accept/Reject Crash (studentId undefined)
- **Problem**: `handleReview` in InternshipApplicationsScreen crashed with "Cannot read properties of undefined (reading '0')" because API review response may return `studentId` as plain string, not populated object
- **Fix**: Preserve original populated fields when updating application in state: `{ ...a, ...updated, studentId: a.studentId, internshipId: a.internshipId, companyId: a.companyId }`

### 11.7 CompanyDetailsScreen Hooks Order Error
- **Problem**: `useState` called after early returns, violating React hooks rules
- **Fix**: Moved `logoError` state declaration above all early returns. Replaced `useState(() => getImgUrl(...))` with plain `const logo = ...` variable.

### 11.8 Select Component React 19 Incompatibility
- **Problem**: React 19 breaks `child.type === 'option'` detection, making `Select` with `<option>` children unusable
- **Fix**: Switched all Select usages to use `options` prop + `setValue()` from react-hook-form instead of `register().onChange` with `<option>` children. Updated Select.tsx to support both patterns but `options` is the recommended path.

### 11.9 preKnowledge Field Name Mismatch
- **Problem**: Frontend was sending `preknowledgeToStart` (string) but API expects `preKnowledge` (array of strings)
- **Fix**: Changed field name to `preKnowledge`, type to `string[]`, split comma-separated textarea input like skills. Displayed as bulleted list on applications page.

### 11.10 Profile Images localStorage Fallback Removed
- **Problem**: Profile/cover pictures had localStorage fallbacks (`LS_PROFILE_PICTURE`, `LS_COVER_PICTURE`) that could show stale images
- **Fix**: Removed all localStorage fallback code from constants, authSlice, userSlice. Images come exclusively from `user.profilePicture` / `user.coverPicture` API response.

### 11.11 Billing Callback Credits Comparison
- **Problem**: Payment callback relied on `confirmPayment()` response which wasn't reliable
- **Fix**: Save `creditsBefore` to `sessionStorage` before redirect; on callback compare `currentCredits > creditsBefore` as source of truth

### 11.12 Company Approval Status via getCompanyById
- **Problem**: `listCompanies()` response omits `approvedByAdmin` field
- **Fix**: After login, call `getCompanyById(owned._id)` to get full company data including `approvedByAdmin`. Fallback defaults added to all company service methods.

### 11.13 City Search Client-Side
- **Problem**: Backend API doesn't support city/location filter on `GET /internships`
- **Fix**: Client-side filter using company address from `companyMap` instead of sending `location: 'on-site'`

### 11.14 Live Search with Debounce
- **Problem**: Search had a submit button, no real-time filtering
- **Fix**: Removed submit button, added 300ms debounced auto-search on keystroke

### 11.15 Billing Route Protection
- **Problem**: `/company/billing` routes were accessible to non-company users
- **Fix**: Added role guard — redirects to login if `role !== 'company'`

### 11.16 Notifications for Companies
- **Problem**: `NotificationBell` only showed for students; company notification screen was broken (duplicate route group)
- **Fix**: `NotificationBell` renders for both roles. Screen is role-aware (back link, empty text, `new_application` icon). Removed duplicate `(company)/notifications` route group.

### 11.17 Plan Credits Updated
- **Problem**: Plan credits were too high
- **Fix**: Growth 20→15, Enterprise 60→50

### 11.18 Certificate Page
- **Problem**: No way for students to get a completion certificate
- **Fix**: Created `/certificate?name=Student&internshipId=XXX` with professional template (logo, gold theme, signature, print styles). Button shown in My Applications for accepted + completed internships.

### 11.19 Category Counts from API
- **Problem**: Category counts were hardcoded (42, 18, 24, 12, 15, 13)
- **Fix**: 6 parallel API calls with `limit: 1` per category for real counts

### 11.20 Mobile Filter Drawer
- **Problem**: Sidebar filter didn't work on mobile (hidden with no alternative)
- **Fix**: Slide-out drawer triggered by "Filters" button with badge count. Desktop sidebar unchanged. Closes on Escape + backdrop click.

### 11.21 User Dropdown Outside-Click + Escape
- **Problem**: User menus stayed open until clicked again
- **Fix**: `useRef` + `useEffect` for mousedown outside detection. Escape key closes both hamburger menu and user menu.

### 11.22 Internship Card Redesign (Grid/List View Toggle)
- **Problem**: Internship cards had only grid layout with large horizontal gaps
- **Fix**: Grid view with `gap-x-3`. Added Grid/List toggle button. List view: horizontal card layout (logo left, info middle, actions right), responsive `flex-col sm:flex-row`, `flex-wrap` for tags, `w-full max-w-full` to prevent overflow, `min-w-0` parent.

### 11.23 Application Completed Field
- **Problem**: Certificate button showed for all accepted applications regardless of completion
- **Fix**: Added `completed?: boolean` to Application interface. Certificate button only shows when `status === 'accepted' && completed === true`. Added "Complete" button for companies in applications management — calls `PATCH .../applications/{applicationId}/complete`. After completion, shows "Completed" badge.

---

## 12. Key Design Decisions

### Screen Pattern
All pages in `app/` are thin wrappers that render a Screen component from `features/{domain}/screens/`. This keeps routing separate from logic.

### Role Detection (Frontend-Only)
The API has NO role field. Role is determined on the frontend:
- Admin: JWT payload has `role: 'admin'` or user profile has `role: 'admin'`
- Company: user has a company where `createdBy` matches userId
- Student: fallback

### No Optimistic Updates
Notification MarkAsRead and application review do NOT use optimistic updates — they re-fetch data from API after success for consistency.

### FormData for Applications
Apply payload is `FormData` (multipart) because it includes a file. Text fields like `coverLetter` are appended as strings, `answers` is JSON-stringified.

### Custom Select Must Use options Prop
React 19 breaks `<option>` child detection. All Select components must use the `options` array prop with `setValue()` for react-hook-form.

### file-proxy for Resume URLs
Resume URLs are proxied through `/file-proxy/resume.pdf?url=${encodeURIComponent(url)}` to handle CORS/auth issues with direct file access.

---

## 13. Security Notes

- JWT tokens stored in localStorage AND cookies (middleware reads cookies)
- No secrets or keys exposed in frontend code
- Axios interceptor handles 401 auto-refresh silently
- Form validation on both client (Zod) and server (API)
- File uploads accept specific types (images: `image/*`, resumes: `.pdf`)
- OTP confirmation before email-based actions
- Company approval required by admin before appearing publicly
- Delete account requires confirmation step

---

## 14. Build & Deployment

- Build command: `npm run build` — currently 0 errors
- Environment variable: `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:3000/api/v1`)
- Deployed on Vercel from GitHub repo `Ziad-AboElenien/tadrebk`
- Google sign-in requires OAuth consent screen setup in Google Cloud Console (add test users, publish to production after domain verification of `tadrebk.vercel.app`)

---

## 15. File Reference Table

| File Path | Purpose |
|-----------|---------|
| `src/lib/axios.ts` | Axios instance, request/response interceptors, error helpers |
| `src/lib/constants.ts` | LS keys (LS_ACCESS_TOKEN, LS_REFRESH_TOKEN, etc.), TOKEN_TTL_MS |
| `src/lib/file-proxy.ts` | File proxy URL construction for resume viewing |
| `src/store/authSlice.ts` | Auth Redux slice + localStorage/cookie persistence |
| `src/store/userSlice.ts` | User profile Redux slice |
| `src/store/companySlice.ts` | Company profile Redux slice |
| `src/store/internshipSlice.ts` | Internship list/filter Redux slice |
| `src/proxy.ts` | Next.js middleware for route protection |
| `src/services/user.service.ts` | User CRUD, file uploads API |
| `src/services/internship.service.ts` | Internship CRUD, listing API |
| `src/services/company.service.ts` | Company CRUD, file uploads API |
| `src/services/application.service.ts` | Application CRUD, review, cancel, complete, email API |
| `src/services/admin.service.ts` | Admin company management API |
| `src/features/internship/types/index.ts` | Internship, MCQQuestion, WritingQuestion types |
| `src/features/student/screens/certificate.screen.tsx` | Certificate page template |
| `src/features/home/screens/home.tsx` | Full homepage component |
| `src/features/home/screens/about.screen.tsx` | About page with team cards (6 members) |
| `src/features/billing/screens/plans.screen.tsx` | Billing plans listing |
| `src/features/billing/screens/payment-callback.screen.tsx` | Payment callback handler |
| `src/features/notifications/components/NotificationBell.tsx` | Notification bell for both roles |
| `src/features/notifications/screens/notifications.screen.tsx` | Notifications listing screen |
| `src/components/ui/Select.tsx` | Custom Select with options prop + children fallback |
| `src/components/ui/ApplyModal.tsx` | Application modal with cover letter + questions + resume |
| `src/components/ui/ImageLightbox.tsx` | Full-screen image lightbox modal |
| `src/components/layout/Navbar.tsx` | Role-based sticky navbar with user menu |
| `src/components/layout/Footer.tsx` | Server component footer |
| `src/components/shared/SessionLoader.tsx` | Redux hydration on hard refresh |
| `src/components/shared/FilterSidebar.tsx` | Sidebar filter for internship listing + mobile drawer |
| `src/app/providers.tsx` | Redux Provider + SessionLoader + ToastContainer |
| `src/app/globals.css` | Tailwind v4 entry, design tokens, custom utilities |
| `src/app/certificate/page.tsx` | Certificate route wrapper |
| `src/proxy.ts` | Next.js middleware for route protection |
