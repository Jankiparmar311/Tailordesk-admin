# 🧵 TailorDesk Admin Panel

TailorDesk is a modern admin dashboard for tailoring businesses.
It helps tailors manage customers, orders, measurements, and workflow digitally instead of notebooks.

> ⚠️ This project is currently under active development.

---

## 🚀 Features

* 🔐 Authentication (Signup / Login / Logout)
* 👤 Profile management
* 👥 Customer management
* 📦 Order management
* 📊 Dashboard overview
* 🖼 Image upload (cloth design / reference images)
* 🧾 Measurement handling
* 🔄 Real-time database updates

---

## 🛠 Tech Stack

**Frontend**

* Next.js 15 (App Router)
* React
* Tailwind CSS

**State Management**

* Redux Toolkit

**Backend / Services**

* Firebase Authentication
* Firebase Firestore Database
* Cloudinary (Image Storage)

**Other**

* Protected Routes Middleware
* Environment based configuration
* Responsive UI

---

## 📁 Project Structure

```
src/
 ├── app/              → Pages & routing
 ├── components/       → Reusable UI components
 ├── redux/            → Store & slices
 ├── lib/              → Firebase & utilities
 ├── middleware/       → Auth protection
 └── styles/           → Global styles
```

---

## ⚙️ Environment Variables

Create `.env.local` in root:

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```

> Do NOT commit `.env.local`

---

## 🧪 Run Locally

```bash
git clone https://github.com/jankiparmar311/tailordesk-admin.git
cd tailordesk-admin
npm install
npm run dev
```

App will run on:

```
http://localhost:3000
```

---

## 🔐 Authentication Flow

* Firebase handles login/signup
* Middleware protects private routes
* Redux stores user session
* Unauthorized users redirected to login

---

## 📦 Deployment

Deployed on Vercel.

Add same environment variables in Vercel dashboard before deploying.

---

## 📌 Upcoming Features

* Invoice generation (PDF)
* Order status timeline
* SMS / WhatsApp notifications
* Advanced analytics
* Multi-staff support
* Role based permissions

---

## 👨‍💻 Author

**Janki Parmar**

---

## 📄 License

This project is for learning & portfolio purposes.
