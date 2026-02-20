# 🧵 TailorDesk Admin Panel

A modern web admin dashboard for tailoring businesses to manage customers, orders, and measurements digitally.

🌐 Live Demo: https://tailordesk-admin.vercel.app
📦 Repository: https://github.com/Jankiparmar311/Tailordesk-admin

> This project is currently under active development and new features are being added continuously.

---

## ✨ Features

### Authentication

* Secure Signup & Login
* Firebase Authentication
* Protected routes using middleware
* Persistent user session

### Dashboard

* Overview of business activity
* Quick access navigation
* Real-time updates

### Customer Management

* Add new customers
* Store measurements
* Edit & update customer details

### Order Management

* Create orders
* Track order details
* Attach design reference images

### Profile

* Admin profile page
* Account management

### Image Upload

* Upload cloth/design images
* Cloudinary storage integration

---

## 🛠 Tech Stack

**Frontend**

* Next.js 15 (App Router)
* React
* Tailwind CSS

**State Management**

* Redux Toolkit

**Backend & Services**

* Firebase Authentication
* Firebase Firestore Database
* Cloudinary Image Hosting

**Other**

* Route protection middleware
* Environment-based configuration
* Responsive UI

---

## 📂 Folder Structure

```
src/
 ├── app/
 │   ├── (app)/           → Protected pages (dashboard, customers, orders, profile)
 │   ├── login/           → Authentication
 │   ├── signup/          → Authentication
 │   ├── layout.js
 │   └── providers.js
 │
 ├── components/          → Reusable UI components
 ├── hooks/               → Custom React hooks
 ├── lib/                 → Firebase & Cloudinary config
 ├── store/               → Redux store & slices
 └── middleware.js        → Route protection
```

---

## 🔐 Environment Variables

Create `.env.local` in root:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
```

⚠️ Do NOT commit `.env.local` to GitHub

---

## 🧪 Run Locally

```bash
git clone https://github.com/Jankiparmar311/Tailordesk-admin.git
cd Tailordesk-admin
npm install
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 🔒 Authentication Logic

* Firebase handles login & signup
* Middleware protects private routes
* Unauthorized users redirected to login
* Redux stores authenticated user

---

## 🚀 Deployment

The project is deployed on **Vercel**.

Before deploying, add all environment variables in:
Vercel Dashboard → Project → Settings → Environment Variables

---

## 📌 Upcoming Features

* Invoice PDF generation
* Order status timeline
* WhatsApp notifications
* Role based staff accounts
* Analytics dashboard
* Dark mode

---

## 👨‍💻 Author

**Janki Parmar**

---

## 📄 License

This project is created for learning and portfolio purposes.
