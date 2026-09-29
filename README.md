# CRMbyNOVA — Enterprise Growth & Revenue CRM Platform

A complete, fully functional, production-ready HubSpot-style Customer Relationship Management (CRM) web application built with modern web technologies and optimized for instant static hosting (Netlify, Vercel, GitHub Pages).

![React](https://img.shields.io/badge/React-19-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![Vite](https://img.shields.io/badge/Vite-6-purple.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-teal.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## 🚀 Live Demo & Key Highlights
- **100% Client-Side Persistence:** Encrypted `localStorage` architecture simulating a real multi-user backend.
- **Initial Dummy Seed Data:** Automatically populates with realistic companies, contacts, deals, tasks, email templates, communication logs, and team members on first launch.
- **HubSpot-Inspired Design:** Clean UI/UX with professional color tokens, responsive sidebar, command bar search, and toast alerts.

---

## 🔐 Credentials & Authentication

### Super Admin Default Account:
- **Email:** `admin@bridgeye.com`
- **Password:** `Nova123`

### Pre-Configured Demo Accounts (All Roles):
| Role | Email | Password | Permissions Summary |
|---|---|---|---|
| **Super Admin** | `admin@bridgeye.com` | `Nova123` | Full access, user provisioning, database reset/wipe, global config |
| **Admin** | `sarah.chen@bridgeye.com` | `Nova123` | User management (except Super Admin), integrations, all CRM data |
| **Sales Agent** | `marcus.vance@bridgeye.com` | `Nova123` | Own deals, contacts, pipeline stages, activity logging |
| **Editor** | `elena.rostova@bridgeye.com` | `Nova123` | Marketing templates, sequences, content management |
| **Viewer** | `david.kim@bridgeye.com` | `Nova123` | Read-only dashboards, contact directories, reports |

> *Note: When a standard user logs in with a temporary password, the system prompts them to securely change their password on their first session.*

---

## ✨ Features & Modules

### 1. 📊 Executive Dashboard
- **KPI Cards with Trend Indicators:** Total Pipeline Value, Conversion Rate, Active Leads, Total Deals, and Average Deal Cycle Time.
- **Interactive Recharts Visualizations:** Monthly Revenue Trends (Area Chart), Lead Acquisition Channels (Donut/Pie Chart), and Sales Rep Leaderboard (Bar Chart).
- **Global Time-Range Filter:** Filter all dashboard metrics instantly by `Last 24 Hours`, `Last 7 Days`, `Last 30 Days`, `This Year (YTD)`, or **Custom Date Range** with start/end date pickers.

### 2. 📇 Contacts & Companies Directory
- Real-time search, tag filtering, lifecycle stage badges (`Lead`, `Contacted`, `Qualified`, `Customer`, `Churned`), and lead scoring meters.
- Interactive slide-over drawer showing full historical timeline (Notes, Calls, Emails, Meetings) and connected deals.
- Instant activity logging directly into customer history.

### 3. 🎯 Sales Pipeline Kanban Board
- 6 drag-and-drop or status-update stages:
  - *Lead → Contacted → Meeting Scheduled → Proposal Sent → Closed-Won → Closed-Lost*
- Dynamic stage valuations and deal counts.
- Deal creation/editing with win probability, close date, and confetti celebration on `Closed-Won`!

### 4. 📝 Task & Activity Tracker
- Filter by priority (`High`, `Medium`, `Low`), status (`Pending`, `In Progress`, `Completed`), and type (`Follow-up`, `Call`, `Meeting`, `Email`).
- One-click task completion and scheduling.

### 5. 📬 Email & Communication Hub
- Pre-made email templates with dynamic placeholder injection (`{{contact_name}}`, `{{company_name}}`, `{{deal_value}}`).
- Omnichannel timeline feed (Email, WhatsApp, SMS, Phone calls).

### 6. 👥 User Management & RBAC Provisioning
- Admin panel to create team members, assign initial temporary passwords, change roles, and deactivate accounts.

### 7. ⚙️ Settings, App Center & Data Hub
- **Data Export:** Export all CRM data as JSON or CSV.
- **Data Import:** Import contacts via CSV upload with field mapping.
- **App Marketplace:** Mock integration cards with API key modals (*WhatsApp API, Google Sheets, Gmail / Google Calendar, Slack, Stripe, Zapier*).
- **Database Management:** One-click Reset to Dummy Data or Clear All Records safely.

---

## 🛠️ Tech Stack
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS + Lucide React Icons
- **Charts:** Recharts
- **Effects:** Canvas Confetti
- **Hosting Compatibility:** Netlify (with `_redirects`), Vercel, Cloudflare Pages, GitHub Pages

---

## 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/hassan155/CRMbyNOVA.git

# Enter project directory
cd CRMbyNOVA

# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

---

## 📦 Deployment to Netlify
1. Connect this GitHub repository (`CRMbyNOVA`) to Netlify.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. The repository already includes `public/_redirects` to handle Single Page Application routing seamlessly!
