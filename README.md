# 🏋️ GymFit — Professional Gym Management System

A **full-stack Gym Management System** built with **Node.js + Express** backend and **vanilla HTML/CSS/JavaScript** frontend. Features full CRUD operations, real-time dashboard, member tracking, trainer management, and an administration interface with built-in authentication.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v16+ installed

### Installation & Run

```bash
# 1. Clone / navigate into the project folder
cd gymfit

# 2. Install dependencies (backend)
cd gymfit-backend
npm install

# 3. Start the server (serves both API and frontend)
npm run dev          # with nodemon (auto-restart)
# OR
npm start            # standard node

# 4. Open in browser
# http://localhost:3000
```

---

## 📁 Project Structure

The project has been separated into `gymfit-frontend` and `gymfit-backend` for modularity and easy cloud deployment (e.g. Vercel for frontend, Render for backend).

```
gymfit/
│
├── /gymfit-backend            → Node.js backend & API
│   ├── server.js              → Main Express server (entry point)
│   ├── package.json           → Dependencies & npm scripts
│   ├── /routes                → Express routers for Members, Trainers, Plans
│   └── /data                  → JSON file storage (No DB required)
│       ├── members.json
│       ├── trainers.json
│       └── plans.json
│
├── /gymfit-frontend           → Frontend static files
│   ├── index.html             → Home / Landing page
│   ├── about.html             → About Us page
│   ├── register.html          → Member Registration with Payment simulation
│   ├── login.html             → Admin Login Gateway
│   ├── dashboard.html         → Admin dashboard
│   ├── members.html           → Member management
│   ├── trainers.html          → Trainer management
│   ├── plans.html             → Membership plans
│   ├── /css
│   │   └── style.css          → Global Styles & Themes
│   └── /js
│       ├── app.js             → Dynamic API base routing & utilities
│       └── members.js         → Members CRUD frontend logic
│
└── /scripts                   → Utility migration and fix scripts
```

---

## 🔌 API Endpoints

All API endpoints are dynamically routed via `API_BASE` in the frontend so the app works seamlessly in development and production.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/members` | Get all members (supports `?search=`, `?status=`, `?plan=`, `?paymentStatus=`) |
| `GET` | `/api/members/stats` | Get dashboard statistics |
| `GET` | `/api/members/:id` | Get single member |
| `POST` | `/api/members` | Add new member |
| `PUT` | `/api/members/:id` | Update member |
| `DELETE` | `/api/members/:id` | Delete member |
| `GET` | `/api/trainers` | Get all trainers |
| `GET` | `/api/trainers/:id` | Get single trainer |
| `POST` | `/api/trainers` | Add new trainer |
| `PUT` | `/api/trainers/:id` | Update trainer |
| `DELETE` | `/api/trainers/:id` | Delete trainer |
| `GET` | `/api/plans` | Get all membership plans |
| `POST` | `/api/plans` | Add new membership plan |

---

## 🌟 Features

### 📱 100% Mobile Responsive
The entire application, from the public landing pages to the deep admin management tables, has been meticulously styled to look and function perfectly on any mobile or tablet device.
- Large data tables (Members, Plans) implement native horizontal scrolling.
- Sidebars cleanly collapse into mobile hamburger menus.
- Footers natively adjust their margins to avoid overlapping.

### 🏢 Public Pages
- **Modern Landing Page**: Premium VIP aesthetic with services, features and membership options.
- **Dynamic Registration**: Multi-step wizard supporting user selection of Membership plans with dynamic dates calculation and **interactive Card payment simulation**.
- **About Page**: Fully fledged "About Us" highlighting gym value, mission, vision and statistics.

### 🔒 Admin Security
- Secure admin login gateway (`login.html`) utilizing `localStorage` persistence.
- Auto-redirects guests attempting to view dashboard/members to public pages.
- Topbar includes an admin profile panel and notification feed.

### 📊 Dashboard
- Live stats: total, active, expired, unpaid members
- Recent members table
- Expiry alerts (30-day warning)
- Plan breakdown with progress bars
- System notification alerts dropdown in the top navigation

### 👥 Member Management
- Full CRUD: Add / View / Edit / Delete
- Smooth horizontal scrolling for huge datasets on mobile devices.
- Search by name, email, phone
- Filter by status, plan, payment status
- Pagination (8 per page)
- Detailed member view modal
- Auto status update (Active → Expired)

### 🏋️ Trainer Management
- Card-based UI with trainer profiles
- Specialization, rating, experience display
- Full CRUD operations
- Search & filter by status/specialization
- Certification tags

### 💳 Membership Plans
- Customizable Plans Management with **creation of custom plans** (custom colors, features, billing cycles).
- Feature comparison table dynamically rendered in frontend.
- Members-per-plan breakdown with dynamic progress visuals.
- Revenue estimation based on active sign-ups.

### 🎨 UI/UX
- 🌙 Dark / ☀️ Light mode toggle (persisted) on all admin and public pages
- Collapsible sidebar (persisted)
- Toast notifications (success/error/warning/info)
- Interactive dropdown menus on top navigation bar
- Smooth animations & micro-interactions

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Frontend | HTML5, CSS3 (Flexbox/Grid), Vanilla JavaScript |
| Data Storage | JSON files (no database required) |
| Architecture | Frontend / Backend Modularization |

---

## 📌 Notes

- Data is securely stored in local `/gymfit-backend/data/*.json` files.
- The app auto-detects expired memberships on every API call.
- The frontend `js/app.js` checks the environment (`localhost` vs remote URL) to seamlessly direct API calls to the proper endpoint backend server.

---

> Built with ❤️ for fitness professionals who want a clean, fast, and modern gym management solution.
