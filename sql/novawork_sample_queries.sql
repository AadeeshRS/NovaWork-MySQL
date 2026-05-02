USE novawork;

INSERT INTO locations (name, address, city, state, country)
VALUES ('Building A', 'Building A, NovaWork Campus', 'Gurugram', 'Haryana', 'India')
ON DUPLICATE KEY UPDATE address = VALUES(address);

INSERT INTO positions (title)
VALUES ('Software Developer')
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO department (department_id, name, description, manager_id, budget, location_id)
SELECT 'DEPT001', 'Engineering', 'Software Engineering Department', NULL, 5000000.00, location_id
FROM locations
WHERE name = 'Building A'
ON DUPLICATE KEY UPDATE
    description = VALUES(description),
    budget = VALUES(budget),
    location_id = VALUES(location_id);

INSERT INTO employee (employee_id, name, email, password, role_id, department_id, position_id, salary, join_date, phone, address, status)
SELECT 'EMP001', 'John Smith', 'john@novawork.com', '$2b$10$examplehash', r.role_id, 'DEPT001', p.position_id, 750000.00, '2024-01-15', '+91 9876543210', 'Gurugram, Haryana', 'Active'
FROM roles r
JOIN positions p ON p.title = 'Software Developer'
WHERE r.name = 'employee'
ON DUPLICATE KEY UPDATE
    phone = VALUES(phone),
    salary = VALUES(salary),
    department_id = VALUES(department_id),
    position_id = VALUES(position_id);

UPDATE department SET manager_id = 'EMP001' WHERE department_id = 'DEPT001';

UPDATE employee SET phone = '+91 9999999999' WHERE employee_id = 'EMP001';

DELETE FROM attendance WHERE employee_id = 'EMP001' AND date = '2025-01-01';

SELECT e.employee_id, e.name, e.email, d.name AS department
FROM employee e
JOIN department d ON e.department_id = d.department_id
WHERE e.status = 'Active'
ORDER BY e.name;

SELECT d.name AS department, COUNT(e.employee_id) AS total_employees, AVG(e.salary) AS avg_salary
FROM department d
LEFT JOIN employee e ON d.department_id = e.department_id
GROUP BY d.department_id, d.name
HAVING COUNT(e.employee_id) > 0
ORDER BY total_employees DESC;

SELECT
    e.name,
    p.month,
    p.year,
    (p.base_salary + p.allowances + p.bonuses - p.deductions - p.tax) AS net_salary
FROM payroll p
JOIN employee e ON p.employee_id = e.employee_id
WHERE (p.base_salary + p.allowances + p.bonuses - p.deductions - p.tax) > (
    SELECT AVG(base_salary + allowances + bonuses - deductions - tax) FROM payroll
)
ORDER BY net_salary DESC;

SELECT employee_id, name, salary
FROM employee
WHERE salary > (SELECT AVG(salary) FROM employee)
ORDER BY salary DESC;

SELECT
    status,
    COUNT(*) AS count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM attendance), 2) AS percentage
FROM attendance
GROUP BY status
ORDER BY count DESC;

SELECT
    e.name,
    COUNT(l.id) AS total_leaves,
    SUM(DATEDIFF(l.end_date, l.start_date) + 1) AS total_days_off
FROM leaves l
JOIN employee e ON l.employee_id = e.employee_id
WHERE l.status = 'approved'
GROUP BY e.employee_id, e.name
ORDER BY total_days_off DESC
LIMIT 10;

SELECT
    YEAR(a.date) AS year,
    MONTHNAME(a.date) AS month,
    COUNT(DISTINCT a.employee_id) AS employees_tracked,
    ROUND(AVG(
        CASE
            WHEN a.check_in IS NULL OR a.check_out IS NULL THEN NULL
            ELSE TIME_TO_SEC(TIMEDIFF(a.check_out, a.check_in)) / 3600
        END
    ), 2) AS avg_hours,
    SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS total_present,
    SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) AS total_absent
FROM attendance a
GROUP BY YEAR(a.date), MONTH(a.date), MONTHNAME(a.date)
ORDER BY year DESC, MONTH(a.date) DESC;
