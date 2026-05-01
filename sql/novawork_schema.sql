CREATE DATABASE IF NOT EXISTS novawork;
USE novawork;

CREATE TABLE IF NOT EXISTS roles (
    role_id         INT             AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(50)     NOT NULL UNIQUE,
    description     TEXT,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS positions (
    position_id     INT             AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(100)    NOT NULL UNIQUE,
    description     TEXT,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS locations (
    location_id     INT             AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL UNIQUE,
    address         TEXT,
    city            VARCHAR(100),
    state           VARCHAR(100),
    country         VARCHAR(100)    DEFAULT 'India',
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS department (
    department_id   VARCHAR(50)     PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL UNIQUE,
    description     TEXT,
    manager_id      VARCHAR(50),
    budget          DECIMAL(12,2)   CHECK (budget >= 0),
    location_id     INT,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_department_location
        FOREIGN KEY (location_id) REFERENCES locations(location_id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    INDEX idx_department_manager (manager_id),
    INDEX idx_department_location (location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS employee (
    employee_id     VARCHAR(50)     PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    email           VARCHAR(150)    NOT NULL UNIQUE,
    password        VARCHAR(255)    NOT NULL,
    role_id         INT             NOT NULL,
    department_id   VARCHAR(50),
    position_id     INT             NOT NULL,
    salary          DECIMAL(12,2)   NOT NULL CHECK (salary >= 0),
    join_date       DATE            DEFAULT (CURRENT_DATE),
    phone           VARCHAR(20),
    address         TEXT,
    status          ENUM('Active', 'Inactive', 'On Leave') DEFAULT 'Active',
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_employee_role
        FOREIGN KEY (role_id) REFERENCES roles(role_id)
        ON UPDATE CASCADE,

    CONSTRAINT fk_employee_department
        FOREIGN KEY (department_id) REFERENCES department(department_id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT fk_employee_position
        FOREIGN KEY (position_id) REFERENCES positions(position_id)
        ON UPDATE CASCADE,

    INDEX idx_employee_email (email),
    INDEX idx_employee_department (department_id),
    INDEX idx_employee_role (role_id),
    INDEX idx_employee_position (position_id),
    INDEX idx_employee_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE department
    ADD CONSTRAINT fk_department_manager
    FOREIGN KEY (manager_id) REFERENCES employee(employee_id)
    ON UPDATE CASCADE ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS attendance (
    id              INT             AUTO_INCREMENT PRIMARY KEY,
    employee_id     VARCHAR(50)     NOT NULL,
    date            DATE            NOT NULL,
    status          ENUM('present', 'absent', 'late', 'half-day', 'leave') NOT NULL,
    check_in        TIME,
    check_out       TIME,
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
    reason          TEXT            NOT NULL,
    status          ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by     VARCHAR(50),
    approved_date   DATE,
    rejection_reason TEXT,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_leave_employee
        FOREIGN KEY (employee_id) REFERENCES employee(employee_id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_leave_approver
        FOREIGN KEY (approved_by) REFERENCES employee(employee_id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT chk_leave_dates CHECK (end_date >= start_date),

    INDEX idx_leave_employee (employee_id),
    INDEX idx_leave_approver (approved_by),
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

CREATE TABLE IF NOT EXISTS audit_logs (
    audit_id        BIGINT          AUTO_INCREMENT PRIMARY KEY,
    actor_id        VARCHAR(50),
    entity_name     VARCHAR(100)    NOT NULL,
    entity_id       VARCHAR(100)    NOT NULL,
    action          VARCHAR(50)     NOT NULL,
    old_values      JSON,
    new_values      JSON,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_actor
        FOREIGN KEY (actor_id) REFERENCES employee(employee_id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    INDEX idx_audit_actor (actor_id),
    INDEX idx_audit_entity (entity_name, entity_id),
    INDEX idx_audit_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO roles (name, description) VALUES
    ('admin', 'Administrator with full system access'),
    ('employee', 'Standard employee portal access')
ON DUPLICATE KEY UPDATE description = VALUES(description);
