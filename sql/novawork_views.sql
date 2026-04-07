USE novawork;

CREATE OR REPLACE VIEW v_employee_department AS
SELECT
    e.employee_id,
    e.name AS employee_name,
    e.email,
    e.role,
    e.position,
    e.salary,
    e.join_date,
    e.phone,
    e.status AS employee_status,
    d.department_id,
    d.name AS department_name,
    d.head_of_dept,
    d.location AS department_location
FROM employee e
LEFT JOIN department d ON e.department_id = d.department_id;

CREATE OR REPLACE VIEW v_payroll_summary AS
SELECT
    p.id AS payroll_id,
    e.employee_id,
    e.name AS employee_name,
    e.position,
    d.name AS department_name,
    p.month,
    p.year,
    p.base_salary,
    p.allowances,
    p.bonuses,
    p.deductions,
    p.tax,
    p.net_salary,
    p.payment_date,
    p.status AS payment_status
FROM payroll p
JOIN employee e ON p.employee_id = e.employee_id
LEFT JOIN department d ON e.department_id = d.department_id
ORDER BY p.year DESC, p.month DESC;

CREATE OR REPLACE VIEW v_attendance_report AS
SELECT
    a.id AS attendance_id,
    e.employee_id,
    e.name AS employee_name,
    d.name AS department_name,
    a.date,
    a.status,
    a.check_in,
    a.check_out,
    a.working_hours,
    a.notes
FROM attendance a
JOIN employee e ON a.employee_id = e.employee_id
LEFT JOIN department d ON e.department_id = d.department_id
ORDER BY a.date DESC;

CREATE OR REPLACE VIEW v_leave_summary AS
SELECT
    l.id AS leave_id,
    e.employee_id,
    e.name AS employee_name,
    d.name AS department_name,
    l.leave_type,
    l.start_date,
    l.end_date,
    l.days,
    l.reason,
    l.status AS leave_status,
    l.applied_date,
    l.approved_by,
    l.approved_date,
    l.rejection_reason
FROM leaves l
JOIN employee e ON l.employee_id = e.employee_id
LEFT JOIN department d ON e.department_id = d.department_id
ORDER BY l.applied_date DESC;
