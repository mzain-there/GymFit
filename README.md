# 🏋️ GymFit — Gym Management System

A full-stack gym management system with **Node.js + Express** backend and **vanilla HTML/CSS/JS** frontend. Features member tracking, trainer management, subscription plans, payments, real-time dashboard, and admin interface.

## ✨ Features

- 📊 **Real-time Dashboard** — Stats, alerts, recent members, plan breakdown
- 👥 **Member Management** — CRUD, search, filter, status tracking, payment tracking
- 🏋️ **Trainer Management** — CRUD, specialization tracking, search & filter
- 💳 **Plans & Payments** — Multiple subscription tiers, payment tracking & history
- 🎨 **Modern UI** — Dark/light theme, responsive design, smooth animations
- 🔐 **Authentication** — Login/register with session management
- 📈 **Dynamic Stats** — Shows members added this month automatically

## 🚀 Quick Start

### Prerequisites
- Node.js v16+ and NPM

### Setup

```bash
cd gymfit/gymfit-backend
npm install
npm start              # or: npm run dev (with auto-reload)
```

Open **http://localhost:3000** in your browser.

## 📁 Project Structure

```
gymfit/
├── /gymfit-backend           → Node.js Express server
│   ├── server.js             → Entry point
│   ├── package.json          → Dependencies
│   ├── /routes               → API endpoints (members, trainers, plans, payments)
│   └── /data                 → JSON storage (members.json, trainers.json, plans.json, payments.json)
│
└── /gymfit-frontend          → Static HTML/CSS/JS
    ├── dashboard.html        → Main admin dashboard
    ├── members.html          → Member management
    ├── trainers.html         → Trainer management
    ├── plans.html            → Plan management
    ├── payments.html         → Payment tracking
    ├── login.html & register.html
    ├── /css/style.css        → Main stylesheet
    └── /js                   → Frontend logic (app.js, auth.js, members.js)
```

## � API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/members` | GET, POST | List/create members |
| `/api/members/:id` | GET, PUT, DELETE | View/update/delete member |
| `/api/members/stats` | GET | Dashboard statistics (includes `newMembersThisMonth`) |
| `/api/trainers` | GET, POST | List/create trainers |
| `/api/trainers/:id` | GET, PUT, DELETE | View/update/delete trainer |
| `/api/plans` | GET, POST | List/create plans |
| `/api/plans/:id` | GET, PUT, DELETE | View/update/delete plan |
| `/api/payments` | GET, POST | List/create payments |
| `/api/payments/:id` | GET, PUT, DELETE | View/update/delete payment |
| `/api/health` | GET | Health check |

**Query Parameters:** `search`, `status`, `plan`, `paymentStatus`, `specialization`, etc.

## 💾 Data Format

```json
// Member
{ "id": "1", "name": "John", "email": "john@example.com", "membershipPlan": "Premium", 
  "joinDate": "2026-05-25", "expiryDate": "2026-06-25", "status": "Active", "paymentStatus": "Paid" }

// Trainer
{ "id": "1", "name": "Jane", "email": "jane@example.com", "specialization": "Strength Training", "status": "Active" }

// Plan
{ "id": "1", "name": "Premium", "price": 50, "duration": 30, "billingCycle": "Monthly", "features": ["Gym Access"] }

// Payment
{ "id": "1", "memberId": "1", "amount": 50, "planName": "Premium", "status": "Completed" }
```

## 🛠 Tech Stack

**Backend:** Node.js, Express, CORS, UUID, File System (JSON storage)  
**Frontend:** HTML5, CSS3, Vanilla JS, Fetch API, Local Storage  
**Dev Tools:** npm, Nodemon, ES6+

## 📖 Running

```bash
# Development (auto-reload)
npm run dev

# Production
npm start

# Change port
PORT=5000 npm start
```

## 📝 Key Notes

- ✅ No external database (JSON file storage)
- ✅ Single port serves API + frontend
- ✅ Dark theme by default with light mode toggle
- ✅ Fully responsive design
- ✅ Real-time dashboard with dynamic member counters
- ✅ Session-based authentication via localStorage

## 🐛 Troubleshooting

```bash
# Port in use
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # macOS/Linux

# Reinstall dependencies
cd gymfit-backend && npm install
```

---

**Built with 💪 by GymFit Team** | ISC License
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
