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

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev          # with nodemon (auto-restart)
# OR
npm start            # standard node

# 4. Open in browser
# http://localhost:3000
```

---

## 📁 Project Structure

```
gymfit/
│
├── server.js                  → Main Express server (entry point)
├── package.json               → Dependencies & npm scripts
│
├── /routes
│   ├── members.js             → Members CRUD API
│   ├── trainers.js            → Trainers CRUD API
│   └── plans.js               → Plans CRUD API
│
├── /data                      → JSON file storage (no DB required)
│   ├── members.json           → Members data
│   ├── trainers.json          → Trainers data
│   └── plans.json             → Membership plans data
│
└── /public                    → Frontend (served statically)
    ├── index.html             → Home / Landing page
    ├── about.html             → About Us page
    ├── register.html          → Multi-step Public Registration Form
    ├── login.html             → Admin Login Gateway
    ├── dashboard.html         → Admin dashboard
    ├── members.html           → Member management
    ├── trainers.html          → Trainer management
    ├── plans.html             → Membership plans
    │
    ├── /css
    │   └── style.css          → Complete stylesheet (dark/light theme)
    │
    └── /js
        ├── app.js             → Shared utilities (auth, dropdowns, toast, theme)
        └── members.js         → Members CRUD frontend logic
```

---

## 🔌 API Endpoints

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
| `GET` | `/api/health` | Health check |

---

## 🌟 Features

### 🏢 Public Pages
- **Modern Landing Page**: Premium VIP aesthetic with services, features and membership options.
- **Dynamic Registration**: Multi-step wizard supporting user selection of Membership plans with dynamic dates calculation and Cash/Card payment forms.
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
- Fully responsive table rendering optimized for mobile and touchscreen devices
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
- Footer structure implemented consistently across all pages
- Toast notifications (success/error/warning/info)
- Interactive dropdown menus on top navigation bar
- Smooth animations & micro-interactions
- Fully responsive (mobile, tablet, desktop)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Frontend | HTML5, CSS3 (Flexbox/Grid), Vanilla JavaScript |
| Data Storage | JSON files (no database required) |
| API Style | RESTful |

---

## 📌 Notes

- Data is securely stored in local `/data/*.json` files.
- The app auto-detects expired memberships on every API call.
- All forms include client-side + server-side validation.

---

> Built with ❤️ for fitness professionals who want a clean, fast, and modern gym management solution.
