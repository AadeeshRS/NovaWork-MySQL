-- ============================================================
-- NovaWork - Transaction Demonstrations
-- Covers: START TRANSACTION, COMMIT, ROLLBACK, SAVEPOINT
-- ACID Properties: Atomicity, Consistency, Isolation, Durability
-- ============================================================

USE novawork;


-- ============================================================
-- TRANSACTION 1: Hire a New Employee & Update Department Count
-- Demonstrates ATOMICITY — both operations succeed or neither does.
-- If the department update fails, the employee insert is also rolled back.
-- ============================================================

START TRANSACTION;

    INSERT INTO employee (employee_id, name, email, password, role, department_id, position, salary, join_date, phone, address, status)
    VALUES ('EMP099', 'Riya Sharma', 'riya@novawork.com', '$2b$10$examplehash', 'employee', 'DEPT001', 'Junior Developer', 600000.00, CURDATE(), '+91 9123456789', 'Gurugram, Haryana', 'Active');

    UPDATE department
    SET employee_count = employee_count + 1
    WHERE department_id = 'DEPT001';

COMMIT;
-- Both the new employee record and the department count update are
-- permanently saved together. Neither can exist without the other.


-- ============================================================
-- TRANSACTION 2: Salary Revision with ROLLBACK on Error
-- Demonstrates ROLLBACK — if anything goes wrong, revert all changes.
-- ============================================================

START TRANSACTION;

    -- Give a 10% raise to all Engineering employees
    UPDATE employee
    SET salary = salary * 1.10
    WHERE department_id = 'DEPT001' AND status = 'Active';

    -- Deduct the raise cost from the department budget
    UPDATE department
    SET budget = budget - (
        SELECT SUM(salary * 0.10)
        FROM employee
        WHERE department_id = 'DEPT001' AND status = 'Active'
    )
    WHERE department_id = 'DEPT001';

    -- Verify budget hasn't gone negative — if it has, roll back
    -- (In application logic, a check here would trigger ROLLBACK)
COMMIT;

-- To demonstrate a manual rollback scenario:
START TRANSACTION;

    UPDATE employee
    SET salary = salary * 1.50   -- Accidental 50% raise
    WHERE department_id = 'DEPT001';

ROLLBACK;
-- The incorrect salary update is completely undone.
-- The employee table is restored to its previous state.


-- ============================================================
-- TRANSACTION 3: Process Payroll — Atomicity Across Tables
-- Demonstrates that payroll generation and status update are atomic.
-- ============================================================

START TRANSACTION;

    -- Generate payroll record for an employee
    INSERT INTO payroll (employee_id, month, year, base_salary, allowances, bonuses, deductions, tax, net_salary, payment_date, status)
    VALUES (
        'EMP001', 'April', 2025,
        750000.00,    -- base salary
        50000.00,     -- allowances
        25000.00,     -- bonus
        10000.00,     -- deductions
        75000.00,     -- tax (10%)
        740000.00,    -- net salary
        CURDATE(),
        'paid'
    )
    ON DUPLICATE KEY UPDATE
        status       = 'paid',
        payment_date = CURDATE(),
        updated_at   = CURRENT_TIMESTAMP;

    -- Mark employee status as Active (in case they were On Leave)
    UPDATE employee
    SET status = 'Active'
    WHERE employee_id = 'EMP001';

COMMIT;
-- Payroll record and employee status are updated together atomically.


-- ============================================================
-- TRANSACTION 4: Leave Approval with SAVEPOINT
-- Demonstrates SAVEPOINT for partial rollback within a transaction.
-- ============================================================

START TRANSACTION;

    SAVEPOINT before_leave_update;

    -- Approve the leave request
    UPDATE leaves
    SET status       = 'approved',
        approved_by  = 'Admin',
        approved_date = CURDATE()
    WHERE id = 1 AND status = 'pending';

    SAVEPOINT after_leave_update;

    -- Mark employee as On Leave in employee table
    UPDATE employee
    SET status = 'On Leave'
    WHERE employee_id = (SELECT employee_id FROM leaves WHERE id = 1);

    -- If only the employee status update fails, roll back to savepoint
    -- ROLLBACK TO after_leave_update;  -- (used conditionally in app logic)

COMMIT;
-- Both the leave approval and employee status change are committed together.


-- ============================================================
-- TRANSACTION 5: Safe Employee Termination
-- Demonstrates CONSISTENCY — related records across tables stay consistent.
-- Deletes attendance/leave/payroll references safely before removing employee.
-- ============================================================

START TRANSACTION;

    -- Archive or clean up dependent records first
    DELETE FROM attendance WHERE employee_id = 'EMP099';
    DELETE FROM leaves     WHERE employee_id = 'EMP099';
    DELETE FROM payroll    WHERE employee_id = 'EMP099';

    -- Update department count
    UPDATE department
    SET employee_count = employee_count - 1
    WHERE department_id = (
        SELECT department_id FROM employee WHERE employee_id = 'EMP099'
    );

    -- Finally remove the employee record
    DELETE FROM employee WHERE employee_id = 'EMP099';

ROLLBACK;
-- ROLLBACK used here intentionally to preserve demo data.
-- In production, replace ROLLBACK with COMMIT to finalize termination.


-- ============================================================
-- TRANSACTION 6: ISOLATION — Controlling Concurrent Access
-- MySQL supports 4 isolation levels. This demo shows how to set
-- them and what concurrency problem each one prevents.
--
-- Isolation Levels (weakest → strongest):
--   READ UNCOMMITTED → allows dirty reads
--   READ COMMITTED   → prevents dirty reads
--   REPEATABLE READ  → prevents dirty + non-repeatable reads (MySQL default)
--   SERIALIZABLE     → prevents all anomalies, full isolation
-- ============================================================

-- Set session-level isolation to REPEATABLE READ (MySQL InnoDB default)
-- This means: once this transaction reads a row, no other transaction
-- can modify that row until this transaction ends.
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;

START TRANSACTION;

    -- Read an employee's salary — this value will remain consistent
    -- throughout this transaction, even if another session updates it.
    SELECT employee_id, name, salary
    FROM employee
    WHERE employee_id = 'EMP001';

    -- Simulate some processing time / business logic here...

    -- Re-reading the same row returns the SAME value as above
    -- (non-repeatable reads are prevented at REPEATABLE READ level)
    SELECT employee_id, name, salary
    FROM employee
    WHERE employee_id = 'EMP001';

COMMIT;


-- SERIALIZABLE demo: strongest isolation, prevents phantom reads.
-- Use when two concurrent transactions must not interfere at all.
SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;

START TRANSACTION;

    -- Any SELECT here places a shared lock on the result set.
    -- No other transaction can INSERT/UPDATE rows that match this query
    -- until this transaction completes — preventing phantom reads.
    SELECT COUNT(*) AS pending_leaves
    FROM leaves
    WHERE status = 'pending';

COMMIT;

-- Reset back to MySQL default isolation level
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;


-- ============================================================
-- TRANSACTION 7: DURABILITY — Committed Data Persists
-- Durability is guaranteed by InnoDB's Write-Ahead Log (redo log).
-- Once COMMIT is executed, the change is written to disk and will
-- survive a server crash or power failure.
--
-- This cannot be "shown" in a script alone — it is an engine-level
-- guarantee. The demonstration below proves durability behaviorally:
-- after COMMIT, the data is permanently visible to all sessions.
-- ============================================================

START TRANSACTION;

    -- Insert a permanent audit-style log entry
    INSERT INTO employee (employee_id, name, email, password, role, department_id, position, salary, join_date, status)
    VALUES (
        'EMP_DUR_TEST',
        'Durability Test User',
        'durtest@novawork.com',
        '$2b$10$examplehash',
        'employee',
        'DEPT001',
        'Test Engineer',
        500000.00,
        CURDATE(),
        'Active'
    );

COMMIT;
-- After this COMMIT:
-- 1. InnoDB flushes the change to its redo log on disk.
-- 2. The record is now DURABLE — visible to every session immediately.
-- 3. Even if MySQL crashes right now, this row will exist on restart.
-- This is Durability: committed transactions are permanent.

-- Verify the committed data is immediately and persistently visible:
SELECT employee_id, name, position, status
FROM employee
WHERE employee_id = 'EMP_DUR_TEST';

-- Cleanup (remove test record)
DELETE FROM employee WHERE employee_id = 'EMP_DUR_TEST';
