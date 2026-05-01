# NovaWork - Employee Management System

A comprehensive, DBMS-centric full-stack web application designed for managing employee data, attendance, payroll, and leave requests. Built with Node.js, Express, precise MySQL relational logic, and Handlebars templates.

## Academic Project: DBMS Mini Project

**Course:** Database Management Systems (DBMS)  
**Institution:** BML Munjal University  
**Semester:** 4  



## Technology Stack

### Backend
- **Node.js & Express.js** - Async web application framework
- **MySQL & `mysql2`** - Core relational database engine with Promise-based Connection Pooling
- **Handlebars** - Server-side dynamic HTML template rendering
- **express-session** - Strict stateful session management
- **bcryptjs** - Cryptographic password hashing (10 salt rounds) for industry-standard security

## Project Structure

```text
NovaWork/
│
├── config/
│   ├── db.js                 # MySQL Connection Pooling config
│
├── middleware/
│   └── auth.js               # Authorization check middleware
│
├── models/                   # Raw Parameterized SQL Queries (No ORMs)
│   ├── Employee.js           
│   ├── Department.js         
│   ├── Attendance.js         
│   ├── Leave.js              
│   └── Payroll.js            
│
├── public/                   # Static resources
│   ├── css/, js/, images/
│
├── routes/                   # Complex API REST Endpoints
│   ├── auth.js, employees.js, etc.
│
├── sql/                      # Core DBMS Deliverables
│   ├── novawork_schema.sql
│   ├── novawork_procedures.sql
│   ├── novawork_views.sql
│   ├── novawork_sample_queries.sql
│   └── novawork_transactions.sql
│
├── views/                    # Handlebars application templates
│   ├── layouts/
│   ├── partials/
│   ├── admin-dashboard.handlebars, etc.
│
├── package.json
└── server.js                 # Core Express entrypoint
```

## Default Database Credentials

**Admin Account**
- **Email:** `admin@novawork.com`
- **Password:** `password123`

**Employee Example Account**
- **Email:** `emp001@novawork.com`
- **Password:** `password123`

## Installation & Initialization

### Step 1: Database Setup
You must have MySQL running on `localhost:3306`.
Create and execute the schema on your local machine using the provided DDL script:
```bash
mysql -u root -p < sql/novawork_schema.sql
```
*(Ensure your credentials match the ones configured in `config/db.js`)*

### Step 2: Running the Project
Navigate to the root directory and install NodeJS dependencies:
```bash
npm install
```
Start the local server with hot-reloading:
```bash
npm run dev
```
The application will launch and be instantly available at: **http://localhost:3000** 
