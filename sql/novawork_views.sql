USE novawork;

CREATE OR REPLACE VIEW v_employee_department AS
SELECT
    e.employee_id,
    e.name AS employee_name,
    e.email,
    r.name AS role,
    p.title AS position,
    e.salary,
    e.join_date,
    e.phone,
    e.status AS employee_status,
    d.department_id,
    d.name AS department_name,
    d.manager_id,
    m.name AS department_manager,
    l.name AS department_location
FROM employee e
JOIN roles r ON e.role_id = r.role_id
JOIN positions p ON e.position_id = p.position_id
LEFT JOIN department d ON e.department_id = d.department_id
LEFT JOIN employee m ON d.manager_id = m.employee_id
LEFT JOIN locations l ON d.location_id = l.location_id;

CREATE OR REPLACE VIEW v_payroll_summary AS
SELECT
    pr.id AS payroll_id,
    e.employee_id,
    e.name AS employee_name,
    pos.title AS position,
    d.name AS department_name,
    pr.month,
    pr.year,
    pr.base_salary,
    pr.allowances,
    pr.bonuses,
    pr.deductions,
    pr.tax,
    (pr.base_salary + pr.allowances + pr.bonuses - pr.deductions - pr.tax) AS net_salary,
    pr.payment_date,
    pr.status AS payment_status
FROM payroll pr
JOIN employee e ON pr.employee_id = e.employee_id
JOIN positions pos ON e.position_id = pos.position_id
LEFT JOIN department d ON e.department_id = d.department_id
ORDER BY pr.year DESC, pr.month DESC;

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
    CASE
        WHEN a.check_in IS NULL OR a.check_out IS NULL THEN NULL
        ELSE ROUND(TIME_TO_SEC(TIMEDIFF(a.check_out, a.check_in)) / 3600, 2)
    END AS working_hours,
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
    DATEDIFF(l.end_date, l.start_date) + 1 AS days,
    l.reason,
    l.status AS leave_status,
    l.applied_date,
    l.approved_by,
    approver.name AS approved_by_name,
    l.approved_date,
    l.rejection_reason
FROM leaves l
JOIN employee e ON l.employee_id = e.employee_id
LEFT JOIN employee approver ON l.approved_by = approver.employee_id
LEFT JOIN department d ON e.department_id = d.department_id
ORDER BY l.applied_date DESC;
