<div align="center">

# 🪻 NoteFlow 2.0

### *Your Thoughts. Organized Beautifully.*

An enchanting, distraction-free workspace to capture ideas, manage daily tasks, and organize thoughts — built with a modern Lavender aesthetic.

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP-Animations-88CE02?style=for-the-badge&logo=greensock&logoColor=white)](https://greensock.com/gsap/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-7C5CFC?style=for-the-badge)](LICENSE)

[Features](#-key-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Project Architecture](#-project-architecture) • [Author](#-author)

---

</div>

## ✨ Overview

**NoteFlow** is a modern, high-performance web application designed for thinkers, researchers, students, and creators. It combines a clean **Lavender-inspired design system** with instant local-first caching, tactile micro-animations, rich categorization, and a dedicated task manager.

---

## 🚀 Key Features

### 🪻 Modern Lavender Aesthetic
- Curated color tokens featuring brand lavender (`#7C5CFC`), violet hover states (`#6946EC`), and soothing lavender mist backgrounds (`#FAF9FF`).
- Smooth glassmorphism, rounded geometry, and soft drop shadows.
- Universal tactile button animations (`scale(0.96)` on press) with moving shimmer shine sweeps.
- Scroll-triggered reveal animations powered by **GSAP**.

### 📝 Smart Notes Workspace
- **Instant Search**: Millisecond search across all note titles, tags, and bodies.
- **Priority Favorites**: 1-click star to keep critical thoughts pinned at the top.
- **Trash Retention**: Safe 2-step deletion with restore and empty trash actions.
- **View Modes**: Switch dynamically between responsive Grid and compact List layouts.

### 🏷️ Custom Category Management
- Categorize notes by Work, College, Projects, Personal, or create your own custom categories.
- Personalize each category with customizable color palettes.
- Real-time category filtering directly from the sidebar.

### ✅ Dedicated Daily Task Widget
- Integrated **Today's Tasks** checklist widget in the dashboard.
- Set task priorities: 🟢 **Low**, 🟡 **Medium**, 🔴 **High**.
- Real-time completion tracking with quick filter pills (*All*, *To Do*, *Completed*).

### 🔐 Dual-Mode Authentication (Sign In & Sign Up)
- Smooth switcher between **Sign In** and **Create Account**.
- Full registration flow with client validation and Terms & Conditions agreement.
- 1-click Instant Demo login for quick exploration.

### 💾 Local-First & Offline Resilient
- Instant auto-save to browser storage (`localStorage`) ensures zero data loss even during connectivity drops.
- Fast load times with zero server latency.

---

## 🛠️ Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + Custom Modular CSS |
| **Animations** | [GSAP (GreenSock)](https://greensock.com/gsap/) + CSS Keyframe Shimmers |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Backend** | [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) |
| **Data Storage** | Local-First Browser Cache + Express JSON File Store |

---

## 📁 Project Architecture

```plaintext
note-taking-2.0/
├── backend/
│   ├── middleware/
│   │   └── db.js            # JSON DB reader/writer helper
│   ├── routes/
│   │   ├── auth.js          # Authentication endpoints
│   │   └── notes.js         # Notes REST API endpoints
│   ├── package.json
│   └── server.js            # Express server entry point
│
├── frontend/
│   ├── src/
│   │   ├── assets/          # App media & icons
│   │   ├── components/      # Reusable UI components
│   │   │   ├── landing/     # Hero, Mockup, Trust bar, Features
│   │   │   ├── ui/          # Button, Modals, Inputs
│   │   │   ├── BrandLogo.jsx
│   │   │   ├── CalendarWidget.jsx
│   │   │   ├── CategoryModal.jsx
│   │   │   ├── LoginCard.jsx
│   │   │   ├── NoteEditor.jsx
│   │   │   └── TaskModal.jsx
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   └── LoginPage.jsx
│   │   ├── dashboard.css    # Dashboard layout & widget styles
│   │   ├── styles.css       # Landing page & global animations
│   │   ├── main.jsx         # App router & entry point
│   ├── tailwind.config.js   # Lavender design system tokens
│   ├── vite.config.js       # Vite build configuration
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🏁 Getting Started

### Prerequisites
Make sure you have **Node.js** (v18 or higher) installed on your system.

### 1. Clone the Repository
```bash
git clone https://github.com/harapriyax/Note-taking-app.git
cd Note-taking-app
```

### 2. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 3. Run Backend (Optional)
```bash
cd ../backend
npm install
node server.js
```
The API server will run on **`http://localhost:5000`**.

---

## 🎨 Color Palette Reference

| Color Name | Hex Code | Preview | Usage |
| :--- | :---: | :---: | :--- |
| **Primary Lavender** | `#7C5CFC` | `🟣` | Buttons, Active states, Brand accents |
| **Lavender Dark** | `#6946EC` | `🪻` | Hover states, Gradient endpoints |
| **Lavender Tint** | `#F0ECFD` | `🌸` | Badges, Active tab highlights |
| **Lavender Border** | `#E8E2FA` | `⚪` | Card borders, Dividers |
| **Canvas Background**| `#FAF9FF` | `✨` | Page shell background |
| **Text Primary** | `#1E1938` | `⬛` | High-contrast plum headings |
| **Text Muted** | `#6B6584` | `🔘` | Body copy, secondary labels |

---

## 👩‍💻 Author

Created with ❤️ by **[Harapriya](https://github.com/harapriyax)**

- GitHub: [@harapriyax](https://github.com/harapriyax)
- Repository: [Note-taking-app](https://github.com/harapriyax/Note-taking-app)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
