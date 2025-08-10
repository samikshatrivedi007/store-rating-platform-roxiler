# 🌟 Store Rating Platform - Backend

Welcome to the **Store Rating Platform** backend repository! This project powers a dynamic web app where users can register, login, and rate their favorite stores — all with secure, role-based access control.

---

## 🚀 Features

- 🔐 User authentication & role-based authorization (User, Store Owner, Admin)  
- 🏪 Store management: add, update, delete stores (Owner only)  
- ⭐ Rate stores with values from 1 to 5  
- 📊 View average ratings and detailed store reviews  
- 📈 Admin dashboard with key stats on users, stores & ratings  
- 🔄 Input validation & error handling for smooth UX  

---

## 🛠️ Tech Stack

| Technology      | Description                   |
| --------------- | -----------------------------|
| **Node.js**     | Backend runtime environment  |
| **Express.js**  | Web framework for Node.js    |
| **PostgreSQL**       | Relational database          |
| **Prisma ORM**  | Database ORM & migrations    |
| **TypeScript**  | Strongly typed JavaScript    |
| **JWT**         | JSON Web Token authentication|
| **Zod**         | Schema validation            |

---

## 🔗 Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/samikshatrivedi007/store-rating-platform-roxiler-backend.git
cd store-rating-platform-roxiler-backend
```
### 2.Install dependencies
```bash
npm install
```
### 3. Run database migrations
```bash
npx prisma migrate deploy
```
### 4. Start the server (development mode)
```bash
npm run dev
```
---
## 📚 API Endpoints Overview
```bash
| Endpoint                  | Method | Description                           | Access             |
| ------------------------- | ------ | ------------------------------------- | ------------------ |
| `/api/auth/register`      | POST   | Register a new user                   | Public             |
| `/api/auth/login`         | POST   | User login, returns JWT token         | Public             |
| `/api/stores`             | GET    | List all stores                       | Public             |
| `/api/stores/:id`         | GET    | Get store details with ratings        | Public             |
| `/api/stores`             | POST   | Create a store (store owner only)     | Store Owner        |
| `/api/stores/:id/ratings` | POST   | Submit rating for a store (user only) | Authenticated User |
| `/api/admin/dashboard`    | GET    | Admin stats: users, stores, ratings   | Admin              |

```

## 🧩 Project Structure
```bash
├── src
│   ├── controllers       # Route handlers
│   ├── middlewares       # Auth and validation middleware
│   ├── prisma            # Prisma client & schema
│   ├── routes            # API route definitions
│   ├── validations       # Request data validation schemas
│   └── utils             # Helper functions
├── .env                  # Environment variables
├── package.json          # Dependencies & scripts
└── README.md             # This file
```
