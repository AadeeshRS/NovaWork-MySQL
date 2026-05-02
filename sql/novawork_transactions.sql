USE novawork;


INSERT INTO positions (title)
VALUES ('Junior Developer'), ('Test Engineer')
ON DUPLICATE KEY UPDATE title = VALUES(title);

START TRANSACTION;

    INSERT INTO employee (employee_id, name, email, password, role_id, department_id, position_id, salary, join_date, phone, address, status)
    SELECT 'EMP099', 'Riya Sharma', 'riya@novawork.com', '$2b$10$examplehash', r.role_id, 'DEPT001', p.position_id, 600000.00, CURDATE(), '+91 9123456789', 'Gurugram, Haryana', 'Active'
    FROM roles r
    JOIN positions p ON p.title = 'Junior Developer'
    WHERE r.name = 'employee'
    ON DUPLICATE KEY UPDATE
        salary = VALUES(salary),
        status = VALUES(status);

COMMIT;


START TRANSACTION;

    UPDATE employee
    SET salary = salary * 1.10
    WHERE department_id = 'DEPT001' AND status = 'Active';

    UPDATE department
    SET budget = budget - (
        SELECT SUM(salary * 0.10)
        FROM employee
        WHERE department_id = 'DEPT001' AND status = 'Active'
    )
    WHERE department_id = 'DEPT001';

COMMIT;

START TRANSACTION;

    UPDATE employee
    SET salary = salary * 1.50
    WHERE department_id = 'DEPT001';

ROLLBACK;

START TRANSACTION;

    INSERT INTO payroll (employee_id, month, year, base_salary, allowances, bonuses, deductions, tax, payment_date, status)
    VALUES (
        'EMP001', 'April', 2025,
        750000.00,
        50000.00,
        25000.00,
        10000.00,
        75000.00,
        CURDATE(),
        'paid'
    )
    ON DUPLICATE KEY UPDATE
        status       = 'paid',
        payment_date = CURDATE(),
        updated_at   = CURRENT_TIMESTAMP;

    UPDATE employee
    SET status = 'Active'
    WHERE employee_id = 'EMP001';

COMMIT;


START TRANSACTION;

    SAVEPOINT before_leave_update;

    UPDATE leaves
    SET status        = 'approved',
        approved_by   = 'ADMIN001',
        approved_date = CURDATE()
    WHERE id = 1 AND status = 'pending';

    SAVEPOINT after_leave_update;

    UPDATE employee
    SET status = 'On Leave'
    WHERE employee_id = (SELECT employee_id FROM leaves WHERE id = 1);

COMMIT;


START TRANSACTION;

    UPDATE department SET manager_id = NULL WHERE manager_id = 'EMP099';
    DELETE FROM attendance WHERE employee_id = 'EMP099';
    DELETE FROM leaves     WHERE employee_id = 'EMP099';
    DELETE FROM payroll    WHERE employee_id = 'EMP099';
    DELETE FROM employee   WHERE employee_id = 'EMP099';

ROLLBACK;



SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;

START TRANSACTION;

    SELECT employee_id, name, salary
    FROM employee
    WHERE employee_id = 'EMP001';

    SELECT employee_id, name, salary
    FROM employee
    WHERE employee_id = 'EMP001';

COMMIT;

SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;

START TRANSACTION;

    SELECT COUNT(*) AS pending_leaves
    FROM leaves
    WHERE status = 'pending';

COMMIT;

SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;



START TRANSACTION;

    INSERT INTO employee (employee_id, name, email, password, role_id, department_id, position_id, salary, join_date, status)
    SELECT 'EMP_DUR_TEST', 'Durability Test User', 'durtest@novawork.com', '$2b$10$examplehash', r.role_id, 'DEPT001', p.position_id, 500000.00, CURDATE(), 'Active'
    FROM roles r
    JOIN positions p ON p.title = 'Test Engineer'
    WHERE r.name = 'employee'
    ON DUPLICATE KEY UPDATE status = VALUES(status);

COMMIT;

SELECT e.employee_id, e.name, p.title AS position, e.status
FROM employee e
JOIN positions p ON e.position_id = p.position_id
WHERE e.employee_id = 'EMP_DUR_TEST';

DELETE FROM employee WHERE employee_id = 'EMP_DUR_TEST';
