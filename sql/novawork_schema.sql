CREATE DATABASE IF NOT EXISTS novawork;
USE novawork;

CREATE TABLE IF NOT EXISTS department (
    department_id   VARCHAR(50)     PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL UNIQUE,
    description     TEXT,
    head_of_dept    VARCHAR(100),
    employee_count  INT             DEFAULT 0 CHECK (employee_count >= 0),
    budget          DECIMAL(12,2)   CHECK (budget >= 0),
    location        VARCHAR(200),
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS employee (
    employee_id     VARCHAR(50)     PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    email           VARCHAR(150)    NOT NULL UNIQUE,
    password        VARCHAR(255)    NOT NULL,
    role            ENUM('admin', 'employee') DEFAULT 'employee',
    department_id   VARCHAR(50),
    position        VARCHAR(100)    NOT NULL,
    salary          DECIMAL(12,2)   NOT NULL CHECK (salary >= 0),
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
    INDEX idx_employee_department (department_id),
    INDEX idx_employee_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS attendance (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    employee_id     VARCHAR(50)     NOT NULL,
    date            DATE            NOT NULL,
    status          ENUM('present', 'absent', 'late', 'half-day', 'leave') NOT NULL,
    check_in        VARCHAR(10),
    check_out       VARCHAR(10),
    working_hours   DECIMAL(4,2)    CHECK (working_hours >= 0 AND working_hours <= 24),
    notes           TEXT,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_attendance_employee
        FOREIGN KEY (employee_id) REFERENCES employee(employee_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    UNIQUE INDEX idx_attendance_emp_date (employee_id, date),
    INDEX idx_attendance_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS leaves (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    employee_id     VARCHAR(50)     NOT NULL,
    applied_date    DATE            DEFAULT (CURRENT_DATE),
    leave_type      ENUM('sick', 'casual', 'annual', 'unpaid', 'maternity', 'paternity') NOT NULL,
    start_date      DATE            NOT NULL,
    end_date        DATE            NOT NULL,
    days            INT             NOT NULL CHECK (days > 0),
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

    CONSTRAINT chk_leave_dates CHECK (end_date >= start_date),

    INDEX idx_leave_employee (employee_id),
    INDEX idx_leave_status (status),
    INDEX idx_leave_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS payroll (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    employee_id     VARCHAR(50)     NOT NULL,
    month           VARCHAR(20)     NOT NULL,
    year            INT             NOT NULL CHECK (year >= 2000 AND year <= 2100),
    base_salary     DECIMAL(12,2)   NOT NULL CHECK (base_salary >= 0),
    allowances      DECIMAL(12,2)   DEFAULT 0.00 CHECK (allowances >= 0),
    bonuses         DECIMAL(12,2)   DEFAULT 0.00 CHECK (bonuses >= 0),
    deductions      DECIMAL(12,2)   DEFAULT 0.00 CHECK (deductions >= 0),
    tax             DECIMAL(12,2)   DEFAULT 0.00 CHECK (tax >= 0),
    net_salary      DECIMAL(12,2)   NOT NULL CHECK (net_salary >= 0),
    payment_date    DATE,
    status          ENUM('pending', 'paid', 'processing') DEFAULT 'pending',
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_payroll_employee
        FOREIGN KEY (employee_id) REFERENCES employee(employee_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    UNIQUE INDEX idx_payroll_emp_month_year (employee_id, month, year),
    INDEX idx_payroll_status (status),
    INDEX idx_payroll_date (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
