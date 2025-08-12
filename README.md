# RBAC Backend – MERN Stack

A **Role-Based Access Control (RBAC)** backend built with **Node.js**, **Express.js**, and **MongoDB** for secure and scalable authentication/authorization.  
Designed to integrate easily with MERN stack applications.

---

## 🚀 Features
- 🔐 **JWT Authentication** (Access + Refresh Tokens)
- 👥 **Role-based permissions** (e.g., `Admin`, `Manager`, `User`)
- 🔄 **Token refresh system**
- 🛡 **Password hashing** with bcrypt
- 🧩 Modular **controller-service-repository** structure
- 📜 Centralized error handling & logging
- 📂 Configurable `.env` for environment variables
- 🛠 MongoDB with Mongoose ORM

---

## 📂 Project Structure
rbac-backend/
│── src/
│ ├── config/ # DB connection, JWT secrets
│ ├── controllers/ # Request handling logic
│ ├── middlewares/ # Auth & role-based access middlewares
│ ├── models/ # Mongoose schemas
│ ├── routes/ # API route definitions
│ ├── services/ # Business logic
│ ├── utils/ # Helper functions
│ └── app.js # Express app
│
├── .env # Environment variables
├── package.json
└── README.md

---

## 🛠 Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (Access + Refresh Tokens)
- **Security:** bcrypt, helmet, CORS

---
