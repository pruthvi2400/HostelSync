# HostelSync — Smart Hostel Management & Monitoring Platform

## Live Demo
https://hostel-sync-beige.vercel.app

A full-stack MERN web application for managing hostel operations in educational institutions.  
Built for D.Y. Patil College of Engineering, Akurdi — T.E. Semester VI Internship Project.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React.js (Vite), React Router, Axios |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB (Mongoose ODM)              |
| Auth       | JWT (JSON Web Tokens) + bcryptjs    |
| Deployment | Vercel (frontend) + Render (backend) + MongoDB Atlas |

---

## Features

- **User Authentication** — Register / Login with JWT, role-based protected routes
- **Role-Based Access** — Student, Admin, Warden, Parent — each gets a dedicated portal
- **Room Allocation** — Admin/Warden can allocate & deallocate students to rooms
- **Complaint Management** — Students submit complaints; Warden/Admin update status & resolution
- **Leave Management** — Students apply for leave; Warden/Admin approve or reject
- **Attendance Tracking** — Mark and view student attendance with percentage stats
- **Mess / Food Menu** — Weekly mess menu management, today's menu highlighted
- **Fee Tracking** — Admin adds fee records; mark as paid; summary cards for totals
- **Notifications** — Broadcast notices from Admin/Warden; unread badge in topbar
- **User Management** — Admin views/searches/deletes all users; Warden views students
- **Profile Management** — All users can update their name, phone, address, emergency contact
- **Admin Dashboard** — Stats: total students, available rooms, pending complaints/leaves/fees
- **Parent Monitoring** — Parents can view their ward's attendance, leave, and fee records

---

## Project Structure

```
hostelSync/
│
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── middleware/
│   │   └── auth.js                # JWT verify + role authorization
│   ├── models/
│   │   ├── User.js
│   │   ├── Room.js
│   │   ├── Complaint.js
│   │   ├── Leave.js
│   │   ├── Attendance.js
│   │   ├── MessMenu.js
│   │   ├── Fee.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── rooms.js
│   │   ├── complaints.js
│   │   ├── leaves.js
│   │   ├── attendance.js
│   │   ├── mess.js
│   │   ├── fees.js
│   │   └── notifications.js
│   ├── .env                       # Environment variables (see below)
│   ├── seed.js                    # One-time demo data seeder
│   ├── server.js                  # Express app entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js           # Axios instance with JWT interceptor
    │   ├── context/
    │   │   └── AuthContext.jsx    # Global auth state
    │   ├── components/
    │   │   ├── Layout.jsx         # Sidebar + Topbar wrapper
    │   │   ├── Sidebar.jsx        # Role-specific navigation
    │   │   └── ProtectedRoute.jsx # Route guard
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx      # Role-specific stats & recent activity
    │   │   ├── Rooms.jsx
    │   │   ├── Complaints.jsx
    │   │   ├── Leaves.jsx
    │   │   ├── Attendance.jsx
    │   │   ├── Mess.jsx
    │   │   ├── Fees.jsx
    │   │   ├── Notifications.jsx
    │   │   ├── Profile.jsx
    │   │   └── Users.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Prerequisites

Make sure you have these installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/try/download/community) running locally

Start MongoDB locally (if not already running):
```bash
mongod
```
Or use MongoDB Compass and connect to `mongodb://localhost:27017/`

---

## Setup & Run

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd hostelSync
```

### 2. Setup the Backend

```bash
cd backend
npm install
```

The `.env` file is already configured with:
```
MONGO_URI=mongodb://localhost:27017/hostelsync
JWT_SECRET=hostelsync_super_secret_key_2024
PORT=5001
```

> **Note:** Port 5001 is used because macOS reserves port 5000 for AirPlay/ControlCenter.  
> On Windows/Linux you can change it to 5000 if you prefer.

### 3. Seed the Database (run once)

This creates demo users, rooms, mess menu, and notifications:

```bash
node seed.js
```

Expected output:
```
Connected to MongoDB
✅ Database seeded successfully!

Login credentials:
  Admin:   admin@hostel.com   / admin123
  Warden:  warden@hostel.com  / warden123
  Student: student@hostel.com / student123
  Parent:  parent@hostel.com  / parent123
```

### 4. Start the Backend Server

```bash
npm run dev
```

Server starts at: `http://localhost:5001`

### 5. Setup the Frontend (new terminal)

```bash
cd ../frontend
npm install
npm run dev
```

Frontend starts at: `http://localhost:3000`

Open your browser at **http://localhost:3000** and log in.

---

## Demo Login Credentials

| Role    | Email                 | Password   | Access                                          |
|---------|-----------------------|------------|-------------------------------------------------|
| Admin   | admin@hostel.com      | admin123   | Full access — all modules + user management     |
| Warden  | warden@hostel.com     | warden123  | Students, rooms, complaints, leaves, attendance |
| Student | student@hostel.com    | student123 | Own room, complaints, leave, attendance, fees   |
| Parent  | parent@hostel.com     | parent123  | Ward's attendance, leave status, fee records    |

---

## API Endpoints

| Method | Endpoint                        | Description                    | Auth Required |
|--------|---------------------------------|--------------------------------|---------------|
| POST   | /api/auth/register              | Register new user              | No            |
| POST   | /api/auth/login                 | Login                          | No            |
| GET    | /api/auth/me                    | Get current user               | Yes           |
| GET    | /api/users                      | Get all users                  | Admin         |
| GET    | /api/users/students             | Get all students               | Admin/Warden  |
| PUT    | /api/users/me                   | Update profile                 | Yes           |
| DELETE | /api/users/:id                  | Delete user                    | Admin         |
| GET    | /api/rooms                      | List all rooms                 | Yes           |
| POST   | /api/rooms                      | Create room                    | Admin         |
| PUT    | /api/rooms/:id                  | Update room                    | Admin         |
| POST   | /api/rooms/:id/allocate         | Allocate student to room       | Admin/Warden  |
| POST   | /api/rooms/:id/deallocate       | Remove student from room       | Admin/Warden  |
| GET    | /api/complaints                 | List complaints (role-filtered)| Yes           |
| POST   | /api/complaints                 | Submit complaint               | Student       |
| PUT    | /api/complaints/:id             | Update complaint status        | Admin/Warden  |
| GET    | /api/leaves                     | List leave requests            | Yes           |
| POST   | /api/leaves                     | Apply for leave                | Student       |
| PUT    | /api/leaves/:id                 | Approve / reject leave         | Admin/Warden  |
| GET    | /api/attendance                 | List attendance records        | Yes           |
| POST   | /api/attendance/single          | Mark single attendance         | Admin/Warden  |
| GET    | /api/mess                       | Get mess menu                  | Yes           |
| POST   | /api/mess                       | Add mess menu entry            | Admin/Warden  |
| PUT    | /api/mess/:id                   | Update mess menu               | Admin/Warden  |
| DELETE | /api/mess/:id                   | Delete mess menu entry         | Admin/Warden  |
| GET    | /api/fees                       | List fees (role-filtered)      | Yes           |
| POST   | /api/fees                       | Add fee record                 | Admin         |
| PUT    | /api/fees/:id                   | Update fee / mark paid         | Admin         |
| GET    | /api/notifications              | Get notifications              | Yes           |
| POST   | /api/notifications              | Send notification              | Admin/Warden  |
| PUT    | /api/notifications/:id/read     | Mark single as read            | Yes           |
| PUT    | /api/notifications/read-all     | Mark all as read               | Yes           |

---

## Team Members

| Name                | Roll No   | Role                     | Contribution                              |
|---------------------|-----------|--------------------------|-------------------------------------------|
| Shreshail Shinde    | TEAIDA22  | Backend Developer        | REST APIs, JWT auth, MongoDB schema       |
| Chirag Jogi         | TEAIDA61  | Frontend Developer       | React UI, dashboards, component design    |
| Pruthviraj Sonowane | TEAIDA29  | Full Stack / Integration | Module integration, testing & bug fixing  |
| Bhupendra Bhaskar   | TEAIDA30  | Documentation & QA       | Report writing, Postman testing           |

**Faculty Guide:** Mrs. Aparana Lavangade & Mrs. Ashika Hirulkar  
**Department:** Artificial Intelligence and Data Science, D.Y. Patil College of Engineering, Akurdi

---

## Future Enhancements

- Real-time updates via Socket.IO
- Native mobile app (React Native)
- Visitor entry/exit log module
- Email/SMS notifications integration
- Export reports to PDF/Excel
