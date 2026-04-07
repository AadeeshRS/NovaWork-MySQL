require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

let pool;

const initializeDB = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || ''
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'novawork'}\``);
    await connection.end();

    pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'novawork',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    await createTables();
    console.log(`MySQL Connected: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`Database Name: ${process.env.DB_NAME || 'novawork'}`);

    return pool;
};

const createTables = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS department (
            department_id   VARCHAR(50)     PRIMARY KEY,
            name            VARCHAR(100)    NOT NULL UNIQUE,
            description     TEXT,
            head_of_dept    VARCHAR(100),
            employee_count  INT             DEFAULT 0,
            budget          DECIMAL(12,2),
            location        VARCHAR(200),
            created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
            updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS employee (
            employee_id     VARCHAR(50)     PRIMARY KEY,
            name            VARCHAR(100)    NOT NULL,
            email           VARCHAR(150)    NOT NULL UNIQUE,
            password        VARCHAR(255)    NOT NULL,
            role            ENUM('admin', 'employee') DEFAULT 'employee',
            department_id   VARCHAR(50),
            position        VARCHAR(100)    NOT NULL,
            salary          DECIMAL(12,2)   NOT NULL,
            join_date       DATE            DEFAULT (CURRENT_DATE),
            phone           VARCHAR(20),
            address         TEXT,
            status          ENUM('Active', 'Inactive', 'On Leave') DEFAULT 'Active',
            created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
            updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_employee_department
                FOREIGN KEY (department_id) REFERENCES department(department_id)
                ON UPDATE CASCADE ON DELETE SET NULL,
            INDEX idx_employee_email (email),
            INDEX idx_employee_department (department_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS attendance (
            id              INT             AUTO_INCREMENT PRIMARY KEY,
            employee_id     VARCHAR(50)     NOT NULL,
            date            DATE            NOT NULL,
            status          ENUM('present', 'absent', 'late', 'half-day', 'leave') NOT NULL,
            check_in        VARCHAR(10),
            check_out       VARCHAR(10),
            working_hours   DECIMAL(4,2),
            notes           TEXT,
            created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
            updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_attendance_employee
                FOREIGN KEY (employee_id) REFERENCES employee(employee_id)
                ON UPDATE CASCADE ON DELETE CASCADE,
            UNIQUE INDEX idx_attendance_emp_date (employee_id, date),
            INDEX idx_attendance_date (date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS leaves (
            id              INT             AUTO_INCREMENT PRIMARY KEY,
            employee_id     VARCHAR(50)     NOT NULL,
            applied_date    DATE            DEFAULT (CURRENT_DATE),
            leave_type      ENUM('sick', 'casual', 'annual', 'unpaid', 'maternity', 'paternity') NOT NULL,
            start_date      DATE            NOT NULL,
            end_date        DATE            NOT NULL,
            days            INT             NOT NULL,
            reason          TEXT            NOT NULL,
            status          ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
            approved_by     VARCHAR(100),
            approved_date   DATE,
            rejection_reason TEXT,
            created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
            updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_leave_employee
                FOREIGN KEY (employee_id) REFERENCES employee(employee_id)
                ON UPDATE CASCADE ON DELETE CASCADE,
            INDEX idx_leave_employee (employee_id),
            INDEX idx_leave_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS payroll (
            id              INT             AUTO_INCREMENT PRIMARY KEY,
            employee_id     VARCHAR(50)     NOT NULL,
            month           VARCHAR(20)     NOT NULL,
            year            INT             NOT NULL,
            base_salary     DECIMAL(12,2)   NOT NULL,
            allowances      DECIMAL(12,2)   DEFAULT 0.00,
            bonuses         DECIMAL(12,2)   DEFAULT 0.00,
            deductions      DECIMAL(12,2)   DEFAULT 0.00,
            tax             DECIMAL(12,2)   DEFAULT 0.00,
            net_salary      DECIMAL(12,2)   NOT NULL,
            payment_date    DATE,
            status          ENUM('pending', 'paid', 'processing') DEFAULT 'pending',
            created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
            updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            CONSTRAINT fk_payroll_employee
                FOREIGN KEY (employee_id) REFERENCES employee(employee_id)
                ON UPDATE CASCADE ON DELETE CASCADE,
            UNIQUE INDEX idx_payroll_emp_month_year (employee_id, month, year),
            INDEX idx_payroll_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
};

const getPool = () => {
    if (!pool) {
        throw new Error('Database not initialized. Call initializeDB() first.');
    }
    return pool;
};

module.exports = { initializeDB, getPool };
