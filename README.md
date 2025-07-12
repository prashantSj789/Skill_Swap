# 🛠️ Skill Swap Platform – Backend

This is the **Go (Golang)** backend for the **Skill Swap Platform**, a web application that allows users to exchange skills with each other. Think of it like "Barter for Skills" — users can offer and request skills, manage availability, swap with others, and leave feedback.

> ⚛️ A separate [React](https://react.dev/) frontend is built to interact with this API.

---

## 📦 Tech Stack

- **Go (Golang)** – Backend API
- **Gin** – HTTP web framework
- **GORM** – ORM for PostgreSQL
- **PostgreSQL** – Relational database
- **CORS** – Configured for cross-origin requests (React frontend)
- **Swagger** – Optional API documentation (via swaggo)

---

## 🚀 Features

### ✅ User Functionality

- Register and manage a user profile
- Upload a profile picture (stored in `bytea` format in PostgreSQL)
- List skills they **offer** and **want**
- Set availability (e.g., weekends, evenings)
- Make profile public or private

### 🔍 Search

- Browse/search users by skills
- Fuzzy search supported (e.g., typo-tolerant)

### 🔁 Swap Requests

- Send and receive swap requests
- Accept, reject, or delete pending requests
- Leave ratings or feedback after completion

### 🛡️ Admin

- Ban users or delete inappropriate content
- Monitor all swap requests
- Send platform-wide announcements
- Download user activity reports

---

## ⚙️ Getting Started

### Prerequisites

- Go 1.21+
- PostgreSQL 13+
- React frontend (optional but recommended)

### Run Locally

1. Clone this repo:

```bash
git clone https://github.com/yourname/skillswap-backend.git
cd skillswap-backend
