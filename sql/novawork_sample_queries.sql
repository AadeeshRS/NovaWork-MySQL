USE novawork;

INSERT INTO department (department_id, name, description, head_of_dept, employee_count, budget, location)
VALUES
    ('DEPT001', 'Engineering', 'Software Engineering Department', 'John Smith', 25, 5000000.00, 'Building A'),
    ('DEPT002', 'Marketing', 'Marketing and Communications', 'Jane Doe', 15, 2000000.00, 'Building B');

INSERT INTO employee (employee_id, name, email, password, role, department_id, position, salary, join_date, phone, address, status)
VALUES
    ('EMP001', 'John Smith', 'john@novawork.com', '$2b$10$examplehash', 'employee', 'DEPT001', 'Software Developer', 750000.00, '2024-01-15', '+91 9876543210', 'Gurugram, Haryana', 'Active');

UPDATE employee SET phone = '+91 9999999999' WHERE employee_id = 'EMP001';

UPDATE department SET employee_count = (
    SELECT COUNT(*) FROM employee WHERE department_id = 'DEPT001'
) WHERE department_id = 'DEPT001';

DELETE FROM attendance WHERE employee_id = 'EMP001' AND date = '2025-01-01';

SELECT e.employee_id, e.name, e.email, d.name AS department
FROM employee e
JOIN department d ON e.department_id = d.department_id
WHERE e.status = 'Active'
ORDER BY e.name;

SELECT d.name AS department, COUNT(e.employee_id) AS total_employees, AVG(e.salary) AS avg_salary
FROM department d
LEFT JOIN employee e ON d.department_id = e.department_id
GROUP BY d.name
HAVING COUNT(e.employee_id) > 0
ORDER BY total_employees DESC;

SELECT e.name, p.month, p.year, p.net_salary
FROM payroll p
JOIN employee e ON p.employee_id = e.employee_id
WHERE p.net_salary > (SELECT AVG(net_salary) FROM payroll)
ORDER BY p.net_salary DESC;

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

SELECT e.name, COUNT(l.id) AS total_leaves, SUM(l.days) AS total_days_off
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
    ROUND(AVG(a.working_hours), 2) AS avg_hours,
    SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS total_present,
    SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) AS total_absent
FROM attendance a
GROUP BY YEAR(a.date), MONTH(a.date), MONTHNAME(a.date)
ORDER BY year DESC, MONTH(a.date) DESC;
