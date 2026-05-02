# NovaWork - Employee Management System

A comprehensive, DBMS-centric full-stack web application for managing employee data, attendance, payroll, and leave requests. Built with Node.js, Express, raw parameterized MySQL queries (no ORM), and Handlebars server-side templates.

## Academic Project

**Course:** Database Management Systems (DBMS)
**Institution:** BML Munjal University
**Semester:** 4th Semester, B.Tech CSE

---

## Technology Stack

### Backend
- **Node.js + Express.js** - Async web application framework
- **MySQL + mysql2** - Core relational database with Promise-based connection pooling
- **Handlebars (express-handlebars)** - Server-side dynamic HTML rendering
- **express-session** - Stateful session management
- **bcryptjs** - Password hashing with 10 salt rounds

### Frontend
- Vanilla HTML, CSS, and JavaScript
- No frontend frameworks — DOM manipulation via native fetch API

---

## Features

### Admin Portal
- Dashboard with live statistics (total employees, departments, payroll, attendance)
- Full CRUD for Employees, Departments, Attendance, Payroll, and Leave requests
- Department manager assignment via employee dropdown
- Leave approval and rejection with optional rejection reason
- Attendance tracking with check-in/check-out times

### Employee Portal
- Personal dashboard with salary, attendance, and leave summaries
- View own attendance history
- View payslips and year-to-date earnings
- Edit personal profile (name, email, phone, address)
- Change account password
- Submit leave requests

---

## Project Structure

```
NovaWork/
│
├── config/
│   ├── db.js                 # MySQL connection pool, auto-migration on startup
│   └── seed.js               # Database seeder (roles, positions, locations, users)
│
├── middleware/
│   └── auth.js               # Role-based access control middleware
│
├── models/                   # Raw parameterized SQL queries — no ORM
│   ├── Employee.js
│   ├── Department.js
│   ├── Attendance.js
│   ├── Leave.js
│   └── Payroll.js
│
├── public/
│   ├── js/
│   │   ├── api.js            # Frontend API client class
│   │   └── main.js           # Global utilities (toast notifications, nav highlighting)
│   └── styles/
│       └── base.css
│
├── routes/                   # REST API endpoints
│   ├── auth.js
│   ├── employees.js
│   ├── departments.js
│   ├── attendance.js
│   ├── leaves.js
│   ├── payroll.js
│   └── index.js
│
├── sql/                      # Core DBMS deliverables
│   ├── novawork_schema.sql          # DDL — tables, constraints, indexes
│   ├── novawork_procedures.sql      # Stored procedures
│   ├── novawork_views.sql           # SQL views
│   ├── novawork_sample_queries.sql  # DML and DQL sample queries
│   └── novawork_transactions.sql    # Transaction examples with ACID properties
│
├── views/                    # Handlebars templates
│   ├── layouts/main.handlebars
│   ├── partials/
│   ├── admin-dashboard.handlebars
│   ├── admin-employees.handlebars
│   ├── admin-departments.handlebars
│   ├── admin-attendance.handlebars
│   ├── admin-payroll.handlebars
│   ├── admin-leaves.handlebars
│   ├── employee-dashboard.handlebars
│   ├── employee-attendance.handlebars
│   ├── employee-payslips.handlebars
│   ├── employee-profile.handlebars
│   └── employee-leave.handlebars
│
├── server.js                 # Express entry point
├── package.json
└── .env                      # Environment variables (not committed)
```

---

## Database Schema

The schema is fully normalized to 3NF and includes:

- **roles** — Admin and employee role definitions
- **positions** — Job titles
- **locations** — Office locations
- **department** — Departments with manager FK and budget
- **employee** — Core employee table with FK to roles, positions, departments
- **attendance** — Daily attendance records with check-in/check-out
- **leaves** — Leave requests with approval workflow
- **payroll** — Monthly salary records with allowances, bonuses, deductions, tax
- **audit_logs** — Tracks changes to entities with old/new JSON values

Foreign key relationships use `ON UPDATE CASCADE` and `ON DELETE SET NULL` / `ON DELETE CASCADE` as appropriate.

---

## SQL Deliverables

| File | Contents |
|---|---|
| `novawork_schema.sql` | CREATE TABLE statements, FK constraints, CHECK constraints, indexes |
| `novawork_procedures.sql` | `sp_generate_payroll`, `sp_approve_leave`, `sp_get_department_stats`, `sp_employee_attendance_summary` |
| `novawork_views.sql` | Views for employee summary, department stats, attendance summary, payroll summary, leave status |
| `novawork_sample_queries.sql` | SELECT, INSERT, UPDATE, DELETE, JOIN, GROUP BY, HAVING, subqueries |
| `novawork_transactions.sql` | Transactions demonstrating ACID properties, savepoints, rollback |

---

## Installation and Setup

### Prerequisites
- Node.js v18 or later
- MySQL 8.0 running on `localhost:3306`

### Step 1: Clone and install dependencies

```bash
git clone https://github.com/AadeeshRS/NovaWork-MySQL.git
cd NovaWork-MySQL
npm install
```

### Step 2: Configure environment

Create a `.env` file in the root directory:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=novawork
SESSION_SECRET=your_session_secret
PORT=3000
```

### Step 3: Seed the database

This creates all tables, seeds lookup data, and creates default accounts:

```bash
npm run seed
```

### Step 4: Start the development server

```bash
npm run dev
```

The application will be available at **http://localhost:3000**

---

## Default Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@novawork.com | admin123 |
| Employee | emp001@novawork.com | password123 |

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start server with nodemon (hot reload) |
| `npm start` | Start server without hot reload |
| `npm run seed` | Reset and reseed the database |
