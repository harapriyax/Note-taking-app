# 📋 NoteFlow 2.0 — Complete Infrastructure & File Reference (`files.md`)

This document provides a comprehensive, centralized reference for all cloud resources, databases, API routes, Lambda functions, S3 buckets, and file structures in **NoteFlow 2.0**.

---

## 🌐 1. Live Production Endpoints

| Resource | URL | Details |
| :--- | :--- | :--- |
| **Frontend Web App** | [http://noteflow-live.s3-website.ap-south-1.amazonaws.com](http://noteflow-live.s3-website.ap-south-1.amazonaws.com) | Hosted on Amazon S3 Static Website Hosting |
| **Backend API Gateway** | `https://dm7g8kggq3.execute-api.ap-south-1.amazonaws.com/api` | Amazon API Gateway (HTTP API v2) |
| **AWS Region** | `ap-south-1` | Asia Pacific (Mumbai) |
| **Stage** | `live` | Production Stage |
| **CloudFormation Stack** | `noteflow-api-live` | Auto-managed via Serverless Framework v3 |
| **AWS Account ID** | `370835059417` | Target AWS Account |## 🪣 2. Amazon S3 Buckets

| Bucket Name | Purpose | Configuration & Cache Policies |
| :--- | :--- | :--- |
| **`noteflow-live`** | **Frontend Production Hosting** | • Static Website Hosting enabled (`index.html` as index and error document).<br>• HTML Cache-Control: `no-cache, no-store, must-revalidate`.<br>• Hashed Assets (`/assets/*`): `public, max-age=31536000` (1-year immutable cache). |
| **`noteflow-attachments-live-${accountId}`** | **Note Attachments (Images & PDFs)** | • Dedicated attachments storage for user uploaded photos & documents.<br>• Pre-signed S3 upload URLs with 15-minute expiration.<br>• CORS enabled for `GET, PUT, HEAD`. Public read for `/attachments/*`. |
| **`noteflow-api-live-serverlessdeploymentbucket-9e2astpla1kb`** | **Serverless Framework Artifacts** | • Private bucket.<br>• Stores packaged `.zip` code bundles and CloudFormation templates during `serverless deploy`. |

---

## 🔐 2.1 Amazon Cognito Authentication

* **User Pool:** `noteflow-users-live`
* **App Client:** `noteflow-web-client-live` (Browser Client, No Client Secret)
* **Sign-in Attributes:** `email`
* **Password Policy:** Minimum 8 characters, requiring uppercase, lowercase, and numbers.
* **Email Verification:** Automated 6-digit confirmation codes sent to registered email.
* **Key Features:** Sign Up, Email Verification, Secure Sign In, Forgot Password, and Password Reset.

---

## 🗄️ 3. Amazon DynamoDB Tables

All 4 tables are provisioned in `ap-south-1` with **Pay-Per-Request (On-Demand)** billing mode:

### 3.1. `noteflow-api-users-live`
* **Purpose:** User profile settings and Cognito linkage.
* **Partition Key (PK):** `userId` (Cognito `sub` String)
* **Sort Key (SK):** *None*
* **Global Secondary Indexes (GSI):**
  * `EmailIndex`: Partition Key `email` (String), Projection: `ALL`.
* **Key Attributes:** `userId`, `email`, `fullName`, `createdAt`, `updatedAt`.

### 3.2. `noteflow-api-notes-live`
* **Purpose:** Notes storage, categorization, tagging, favorites, trash, and media attachments.
* **Partition Key (PK):** `userId` (String)
* **Sort Key (SK):** `noteId` (String)
* **Key Attributes:** `userId`, `noteId`, `title`, `content`, `category`, `tags` (List/Array), `color`, `attachments` (Array of S3 upload metadata: `{ id, name, type, mimeType, size, url, key, createdAt }`), `isFavorite` (Boolean), `isTrashed` (Boolean), `createdAt`, `updatedAt`.

### 3.3. `noteflow-api-tasks-live`
* **Purpose:** Daily tasks and to-do item tracking.
* **Partition Key (PK):** `userId` (String)
* **Sort Key (SK):** `taskId` (String)
* **Key Attributes:** `userId`, `taskId`, `text`, `priority` (`High`, `Medium`, `Low`), `done` (Boolean), `createdAt`, `updatedAt`.

### 3.4. `noteflow-api-categories-live`
* **Purpose:** Custom user-defined note categories.
* **Partition Key (PK):** `userId` (String)
* **Sort Key (SK):** `categoryId` (String)
* **Key Attributes:** `userId`, `categoryId`, `name`, `color` (Hex code, e.g. `#e07a4a`), `isCustom` (Boolean), `createdAt`.

---

## 🌐 4. Amazon API Gateway (HTTP API v2)

* **Name:** `live-noteflow-api`
* **API ID:** `dm7g8kggq3`
* **Base Endpoint:** `https://dm7g8kggq3.execute-api.ap-south-1.amazonaws.com`
* **CORS Settings:**
  * **Allowed Origins:** `*`
  * **Allowed Headers:** `Content-Type`, `Authorization`
  * **Allowed Methods:** `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`

---

## ⚡ 5. Complete AWS Lambda Functions (27 Total)

All functions run on **Node.js 20.x** with 256MB memory and a 25s timeout:

| # | Lambda Function Name | Route | Method | Handler Path | Description |
| :-: | :--- | :--- | :--- | :-: | :--- |
| **1** | `noteflow-api-live-authSignup` | `/api/auth/signup` | `POST` | `src/handlers/auth.signup` | Registers new user in AWS Cognito User Pool. |
| **2** | `noteflow-api-live-authConfirmSignup` | `/api/auth/confirm-signup` | `POST` | `src/handlers/auth.confirmSignup` | Verifies user email with 6-digit confirmation code. |
| **3** | `noteflow-api-live-authResendCode` | `/api/auth/resend-code` | `POST` | `src/handlers/auth.resendCode` | Resends confirmation code to unverified user email. |
| **4** | `noteflow-api-live-authLogin` | `/api/auth/login` | `POST` | `src/handlers/auth.login` | Authenticates via Cognito (`USER_PASSWORD_AUTH`) & issues tokens. |
| **5** | `noteflow-api-live-authForgotPassword` | `/api/auth/forgot-password` | `POST` | `src/handlers/auth.forgotPassword` | Initiates password reset & sends code to email. |
| **6** | `noteflow-api-live-authResetPassword` | `/api/auth/reset-password` | `POST` | `src/handlers/auth.resetPassword` | Resets password with confirmation code in Cognito. |
| **7** | `noteflow-api-live-authMe` | `/api/auth/me` | `GET` | `src/handlers/auth.getMe` | Validates Cognito JWT token and returns profile data. |
| **8** | `noteflow-api-live-authProfile` | `/api/auth/profile` | `PUT` | `src/handlers/auth.updateProfile` | Updates user full name and profile fields. |
| **9** | `noteflow-api-live-uploadsPresignedUrl` | `/api/uploads/presigned-url` | `POST` | `src/handlers/uploads.getPresignedUrl` | Generates batch pre-signed S3 URLs for multiple images & PDFs. |
| **10** | `noteflow-api-live-notesList` | `/api/notes` | `GET` | `src/handlers/notes.list` | Retrieves user notes with category, trash, or star filters. |
| **11** | `noteflow-api-live-notesStats` | `/api/notes/stats` | `GET` | `src/handlers/notes.stats` | Returns aggregate counts for active, favorite, and trashed notes. |
| **12** | `noteflow-api-live-notesGetById` | `/api/notes/{id}` | `GET` | `src/handlers/notes.getById` | Fetches a single note by note ID. |
| **13** | `noteflow-api-live-notesCreate` | `/api/notes` | `POST` | `src/handlers/notes.create` | Creates a new note in DynamoDB with a UUID and attachments. |
| **14** | `noteflow-api-live-notesUpdate` | `/api/notes/{id}` | `PUT` | `src/handlers/notes.update` | Updates note content, title, tags, category, or attachments. |
| **15** | `noteflow-api-live-notesToggleFavorite` | `/api/notes/{id}/favorite` | `PUT` | `src/handlers/notes.toggleFavorite` | Toggles the star/favorite status of a note. |
| **16** | `noteflow-api-live-notesTrash` | `/api/notes/{id}/trash` | `PUT` | `src/handlers/notes.trash` | Soft deletes note by setting `isTrashed: true`. |
| **17** | `noteflow-api-live-notesRestore` | `/api/notes/{id}/restore` | `PUT` | `src/handlers/notes.restore` | Restores note from trash by setting `isTrashed: false`. |
| **18** | `noteflow-api-live-notesDelete` | `/api/notes/{id}` | `DELETE` | `src/handlers/notes.remove` | Permanently deletes a note record from DynamoDB. |
| **19** | `noteflow-api-live-tasksList` | `/api/tasks` | `GET` | `src/handlers/tasks.list` | Fetches daily tasks for the user. |
| **20** | `noteflow-api-live-tasksCreate` | `/api/tasks` | `POST` | `src/handlers/tasks.create` | Creates a task with assigned priority (`High`/`Medium`/`Low`). |
| **21** | `noteflow-api-live-tasksUpdate` | `/api/tasks/{id}` | `PUT` | `src/handlers/tasks.update` | Modifies existing task text or priority. |
| **22** | `noteflow-api-live-tasksToggle` | `/api/tasks/{id}/toggle` | `PUT` | `src/handlers/tasks.toggle` | Toggles task completion checkbox (`done`). |
| **23** | `noteflow-api-live-tasksDelete` | `/api/tasks/{id}` | `DELETE` | `src/handlers/tasks.remove` | Deletes a task from DynamoDB. |
| **24** | `noteflow-api-live-categoriesList` | `/api/categories` | `GET` | `src/handlers/categories.list` | Lists custom user categories. |
| **25** | `noteflow-api-live-categoriesCreate` | `/api/categories` | `POST` | `src/handlers/categories.create` | Creates a custom category with color swatch. |
| **26** | `noteflow-api-live-categoriesDelete` | `/api/categories/{id}` | `DELETE` | `src/handlers/categories.remove` | Removes a custom category. |
| **27** | `noteflow-api-live-health` | `/api/health` | `GET` | `src/handlers/health.check` | Public uptime & health verification endpoint. |

---

## 🔒 6. Security & IAM Configuration

* **IAM Execution Role:** `noteflow-api-live-ap-south-1-lambdaRole`
* **Access Policy:**
  * Strict access granted only to the 4 DynamoDB tables (`GetItem`, `PutItem`, `UpdateItem`, `DeleteItem`, `Query`, `Scan`).
  * AWS CloudWatch Logs permissions (`CreateLogGroup`, `CreateLogStream`, `PutLogEvents`).
* **Authentication Scheme:**
  * JWT tokens signed using HMAC SHA-256 (`jwt.js`).
  * Tokens must be included in client HTTP requests via `Authorization: Bearer <token>`.
  * Passwords stored with cryptographic salts using `bcryptjs`.

---

## 📂 7. Project File Directory & Code Organization

```
note taking 2.0/
├── backend/
│   ├── .env                       # Backend local configuration
│   ├── .env.example               # Template environment configuration
│   ├── package.json               # Backend dependencies (aws-sdk, bcryptjs, jsonwebtoken)
│   ├── serverless.yml             # Complete AWS CloudFormation & Lambda definition
│   └── src/
│       ├── handlers/              # Lambda event handler functions
│       │   ├── auth.js            # signup, login, getMe, updateProfile
│       │   ├── categories.js      # list, create, remove
│       │   ├── health.js          # check
│       │   ├── notes.js           # list, stats, getById, create, update, favorite, trash, restore, remove
│       │   └── tasks.js           # list, create, update, toggle, remove
│       ├── lib/
│       │   ├── db.js              # DynamoDB DocumentClient wrapper
│       │   ├── jwt.js             # Token creation & verification utilities
│       │   └── response.js        # Standardized CORS API responses (success, error, notFound)
│       └── models/
│           ├── Category.js        # Category data model
│           ├── Note.js            # Note data model
│           ├── Task.js            # Task data model
│           └── User.js            # User data model
│
├── frontend/
│   ├── .env                       # Frontend environment configuration
│   ├── index.html                 # Main HTML5 entry point with responsive viewport
│   ├── package.json               # React 18, Vite, Lucide-React, GSAP
│   ├── vite.config.js             # Vite development & build configuration
│   ├── tailwind.config.js         # Tailwind CSS configuration
│   ├── postcss.config.js          # PostCSS configuration
│   ├── public/
│   │   └── favicon.svg            # NoteFlow Brand Favicon
│   └── src/
│       ├── main.jsx               # Application entry point, router, and session validator
│       ├── styles.css             # Global design tokens, landing page, animations, buttons
│       ├── dashboard.css          # Dashboard layout, responsive drawer, bottom nav, modals
│       ├── components/
│       │   ├── BrandLogo.jsx      # Reusable brand logo icon & wordmark
│       │   ├── CalendarWidget.jsx # Interactive monthly calendar with today highlighting
│       │   ├── CategoryModal.jsx  # Modal for managing custom categories and color palettes
│       │   ├── LoginCard.jsx      # Glassmorphism auth card (Sign In & Sign Up)
│       │   ├── NoteEditor.jsx     # Full-featured note editor (desktop modal + mobile sheet)
│       │   ├── TaskModal.jsx      # Modal for creating tasks with priority levels
│       │   ├── landing/
│       │   │   ├── Header.jsx     # Responsive landing header with mobile drawer & single login
│       │   │   ├── ProductMockup.jsx # Interactive simulated app preview with notes
│       │   │   └── TrustBar.jsx   # Proof bar displaying global brand icons
│       │   └── ui/
│       │       └── Button.jsx     # Universal button component with micro-animations
│       ├── lib/
│       │   └── api.js             # Fetch client with automated Bearer token attachment
│       └── pages/
│           ├── DashboardPage.jsx  # Main workspace (notes, search, tasks, cloud sync, mobile nav)
│           ├── LandingPage.jsx    # Editorial SaaS landing page with GSAP animations
│           └── LoginPage.jsx      # Auth wrapper page with ambient lavender blur aura
│
├── files.md                       # This comprehensive reference file
└── README.md                      # Project introduction & quick-start guide
```

---

## ⚙️ 8. Environment Variables

### 8.1. `frontend/.env`
```env
# S3 Deployment Bucket & Region
VITE_S3_BUCKET_NAME=noteflow-live
VITE_AWS_REGION=ap-south-1
VITE_APP_URL=http://noteflow-live.s3-website.ap-south-1.amazonaws.com

# Backend API Gateway Endpoint
VITE_API_URL=https://dm7g8kggq3.execute-api.ap-south-1.amazonaws.com/api
```

### 8.2. `backend/.env`
```env
STAGE=live
AWS_REGION=ap-south-1
S3_BUCKET_NAME=noteflow-live
FRONTEND_URL=http://noteflow-live.s3-website.ap-south-1.amazonaws.com

# DynamoDB Tables
USERS_TABLE=noteflow-api-users-live
NOTES_TABLE=noteflow-api-notes-live
TASKS_TABLE=noteflow-api-tasks-live
CATEGORIES_TABLE=noteflow-api-categories-live

# API Gateway & Security
API_GATEWAY_URL=https://dm7g8kggq3.execute-api.ap-south-1.amazonaws.com/api
JWT_SECRET=noteflow-jwt-secret-change-me-to-random-string
```

---

## 🚀 9. Common Deployment Commands

### To Redeploy Backend (AWS Lambda & DynamoDB):
```powershell
cd "d:\code\note taking 2.0\backend"
npx serverless deploy --stage live
```

### To Redeploy Frontend (AWS S3):
```powershell
cd "d:\code\note taking 2.0\frontend"
npm run build
aws s3 sync dist/ s3://noteflow-live/ --delete --cache-control "public, max-age=31536000" --exclude "index.html" --exclude "*.json"
aws s3 cp dist/index.html s3://noteflow-live/index.html --cache-control "no-cache, no-store, must-revalidate"
```

### To Run Locally in Development:
* **Frontend:** `npm run dev` (runs on `http://localhost:5173`)
