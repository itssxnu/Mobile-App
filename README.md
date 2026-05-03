<div align="center">

# 🌴 HD Resorts (Sri Lanka Travel Companion)

**A full-featured, cross-platform travel discovery and booking application with multi-role provider dashboards, seamless PWA support, and real-time community reviews.**

---

![React Native](https://img.shields.io/badge/React_Native-0.74-61DAFB?style=flat-square&logo=react)
![Expo](https://img.shields.io/badge/Expo-51.0-000020?style=flat-square&logo=expo)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=nodedotjs)
![Express](https://img.shields.io/badge/Express.js-4.x-000000?style=flat-square&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?style=flat-square&logo=cloudinary)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

<!-- Live GitHub stats -->
![Last Commit](https://img.shields.io/github/last-commit/itssxnu/Mobile-App?style=flat-square&label=Last%20Commit)
![Languages Count](https://img.shields.io/github/languages/count/itssxnu/Mobile-App?style=flat-square&label=Languages)
![Top Language](https://img.shields.io/github/languages/top/itssxnu/Mobile-App?style=flat-square)
<img src="https://img.shields.io/badge/javascript-26.0%25-yellow?style=flat-square" />

</div>

---

## Overview

**HD Resorts** is a modular, production-ready travel platform built on the MERN stack using Expo and React Native Web. It goes beyond a simple travel catalogue — combining a seamless discovery experience for tourists, a dedicated self-service portal for local service providers, and a powerful admin back-office into a single cohesive system.

### What makes it stand out

| ✨ Feature | Details |
|---|---|
| 📱 Cross-Platform (PWA) | Write once, run anywhere. Fully optimized for Web, iOS, and Android via Expo. |
| 🏡 Multi-Service Bookings | Unified platform for exploring Homestays, Guides, Activities, and Events. |
| 🔐 Role-Based Auth | Secure JWT authentication with strict role authorization (User, Provider, Admin). |
| 📧 Secure Recovery | Robust OTP-based registration and password recovery flows. |
| 📸 Cloudinary Media | Fast, optimized, and secure image uploading and delivery for provider listings. |
| 💬 Community Reviews | Integrated review and rating system across all services with visual attachments. |
| 🗺️ Hidden Gems | Community-driven "Attractions" module to share and discover secret spots. |
| 🎨 Modern Aesthetics | Premium, travel-inspired UI with dynamic layouts and horizontal carousels. |

---

## Feature Matrix

<table>
<thead>
<tr><th>Role</th><th>Key Capabilities</th></tr>
</thead>
<tbody>

<tr>
<td><strong>User / Explorer</strong></td>
<td>Browse curated travel feeds, search for homestays and events, submit community reviews with photos, post hidden "Attractions", and easily upgrade their account to become a provider.</td>
</tr>

<tr>
<td><strong>Provider</strong></td>
<td>Access specialized dashboards (Host, Guide, Event, Activity) to CRUD listings, upload media, manage pricing, and respond to incoming bookings and community reviews.</td>
</tr>

<tr>
<td><strong>Admin</strong></td>
<td>Manage all users across the platform, moderate community content, delete inappropriate reviews/listings, and oversee overall platform activity.</td>
</tr>

</tbody>
</table>

---

## Architecture

```
project-root/
├── backend/
│   ├── src/
│   │   ├── config/              # MongoDB connection, Cloudinary config
│   │   ├── controllers/         # 8 HTTP controllers (auth, homestay, event, etc.)
│   │   ├── middleware/          # JWT auth, Role authorization, Multer uploads
│   │   ├── models/              # Mongoose schemas (User, Event, Activity, etc.)
│   │   ├── routes/              # Express API routing
│   │   ├── utils/               # Nodemailer SMTP setup, Helpers
│   │   └── server.js            # Express application entry point
│   ├── seedEvents.js            # Database seeder utility
│   ├── .env                     # Backend secrets
│   └── package.json
└── mobile/
    ├── app/                     # Expo Router (File-based routing)
    │   ├── (auth)/              # Login, Register, Forgot Password flows
    │   ├── (tabs)/              # Main App screens, Dashboards, Discovery feeds
    │   └── _layout.tsx          # Global navigation stack
    ├── src/
    │   ├── components/          # Reusable UI (ReviewList, Modals, Forms)
    │   ├── config/              # API Base URLs
    │   └── services/            # Axios API call wrappers (authService, reviewService)
    ├── app.json                 # Expo configuration
    └── package.json
```

### Layer Breakdown

| Layer | Packages/Folders | Responsibility |
|---|---|---|
| **Security** | `middleware`, `authService` | JWT signing/verification, OTP flow, Route guards |
| **Routing** | `routes`, `app/(tabs)` | Express endpoints (Backend) & Expo file-based routing (Frontend) |
| **Service** | `controllers`, `services` | Business logic, API communication, email dispatch |
| **Persistence**| `models` | Mongoose Schemas — MongoDB data modeling |
| **Storage** | `multer`, `Cloudinary` | Handling multipart/form-data and remote image hosting |
| **View** | `app/`, `components/` | React Native UI components, Stylesheets |

---

## Domain Model (Key Entities)

```
User ──< Homestay ──< Review
 │           │
 ├──< Guide  ├──< Attraction
 ├──< Event  ├──< Activity
 └──< Token (OTP)
```

---

## Technology Stack

| Concern | Technology |
|---|---|
| Frontend | React Native, Expo, Expo Router |
| Backend | Node.js, Express.js |
| Persistence | MongoDB (Mongoose ODM) |
| File Storage | Cloudinary |
| Security | JWT (JSON Web Tokens), Bcryptjs |
| Email | Nodemailer (SMTP) |
| HTTP Client | Axios |
| Styling | React Native StyleSheet |

---

## Configuration

All secrets are supplied via **environment variables** — no credentials are committed to the repository.

### Backend (`backend/.env`)

| Variable | Purpose |
|---|---|
| `PORT` | API server port (e.g., `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `JWT_EXPIRE` | Token expiration time (e.g., `30d`) |
| `SMTP_HOST` | SMTP host (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (e.g. `587`) |
| `SMTP_EMAIL` | Sender email address |
| `SMTP_PASSWORD` | SMTP app password |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET`| Cloudinary API secret |

### Frontend (`mobile/src/config/apiConfig.ts`)

Update the `API_BASE_URL` to point to your running backend (e.g., `http://localhost:5000` or your Render deployment URL).

---

## Quick Start

### Prerequisites

- **Node.js** (v18+)
- **npm** or **yarn**
- **MongoDB** instance (Local or Atlas)
- **Expo Go** app (optional, for physical device testing)

### 1 — Clone

```bash
git clone https://github.com/itssxnu/Mobile-App.git
cd Mobile-App
```

### 2 — Setup Backend

```bash
cd backend
npm install
```
*Create a `.env` file in the `backend` directory using the configuration table above.*

```bash
# Start the backend server
npm run dev
```

### 3 — Setup Frontend

```bash
cd ../mobile
npm install
```

```bash
# Start the Expo development server
npx expo start
```

Press `w` in the terminal to open the Web App (PWA), or scan the QR code with the Expo Go app to view on a physical device.

---

<div align="center">
  <sub>Built with the MERN Stack, Expo, and a passion for travel discovery.</sub>
</div>
