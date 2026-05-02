USE novawork;

DELIMITER //

CREATE PROCEDURE sp_generate_payroll(
    IN p_employee_id VARCHAR(50),
    IN p_month VARCHAR(20),
    IN p_year INT,
    IN p_allowances DECIMAL(12,2),
    IN p_bonuses DECIMAL(12,2),
    IN p_deductions DECIMAL(12,2),
    IN p_tax_rate DECIMAL(5,2)
)
BEGIN
    DECLARE v_base_salary DECIMAL(12,2);
    DECLARE v_tax DECIMAL(12,2);

    SELECT salary INTO v_base_salary
    FROM employee
    WHERE employee_id = p_employee_id;

    IF v_base_salary IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Employee not found';
    END IF;

    SET v_tax = (v_base_salary + p_allowances + p_bonuses) * (p_tax_rate / 100);

    INSERT INTO payroll (employee_id, month, year, base_salary, allowances, bonuses, deductions, tax, payment_date, status)
    VALUES (p_employee_id, p_month, p_year, v_base_salary, p_allowances, p_bonuses, p_deductions, v_tax, CURDATE(), 'pending')
    ON DUPLICATE KEY UPDATE
        base_salary = v_base_salary,
        allowances = p_allowances,
        bonuses = p_bonuses,
        deductions = p_deductions,
        tax = v_tax,
        updated_at = CURRENT_TIMESTAMP;

    SELECT
        p.*,
        (p.base_salary + p.allowances + p.bonuses - p.deductions - p.tax) AS net_salary
    FROM payroll p
    WHERE p.employee_id = p_employee_id AND p.month = p_month AND p.year = p_year;
END //

CREATE PROCEDURE sp_approve_leave(
    IN p_leave_id INT,
    IN p_approved_by VARCHAR(50),
    IN p_action ENUM('approved', 'rejected'),
    IN p_rejection_reason TEXT
)
BEGIN
    DECLARE v_current_status VARCHAR(20);

    SELECT status INTO v_current_status
    FROM leaves
    WHERE id = p_leave_id;

    IF v_current_status IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Leave request not found';
    END IF;

    IF v_current_status != 'pending' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Leave request is not in pending status';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM employee WHERE employee_id = p_approved_by) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Approver employee not found';
    END IF;

    UPDATE leaves
    SET status = p_action,
        approved_by = p_approved_by,
        approved_date = CURDATE(),
        rejection_reason = CASE WHEN p_action = 'rejected' THEN p_rejection_reason ELSE NULL END
    WHERE id = p_leave_id;

    SELECT
        l.*,
        DATEDIFF(l.end_date, l.start_date) + 1 AS days,
        e.name AS employee_name,
        approver.name AS approved_by_name
    FROM leaves l
    JOIN employee e ON l.employee_id = e.employee_id
    LEFT JOIN employee approver ON l.approved_by = approver.employee_id
    WHERE l.id = p_leave_id;
END //

CREATE PROCEDURE sp_get_department_stats()
BEGIN
    SELECT
        d.department_id,
        d.name AS department_name,
        d.budget,
        loc.name AS location,
        d.manager_id,
        manager.name AS manager_name,
        COUNT(e.employee_id) AS total_employees,
        COALESCE(AVG(e.salary), 0) AS avg_salary,
        COALESCE(SUM(e.salary), 0) AS total_salary_expense,
        SUM(CASE WHEN e.status = 'Active' THEN 1 ELSE 0 END) AS active_employees,
        SUM(CASE WHEN e.status = 'On Leave' THEN 1 ELSE 0 END) AS on_leave_employees
    FROM department d
    LEFT JOIN locations loc ON d.location_id = loc.location_id
    LEFT JOIN employee manager ON d.manager_id = manager.employee_id
    LEFT JOIN employee e ON d.department_id = e.department_id
    GROUP BY d.department_id, d.name, d.budget, loc.name, d.manager_id, manager.name
    ORDER BY d.name;
END //

CREATE PROCEDURE sp_employee_attendance_summary(
    IN p_employee_id VARCHAR(50),
    IN p_month INT,
    IN p_year INT
)
BEGIN
    SELECT
        e.employee_id,
        e.name AS employee_name,
        COUNT(*) AS total_days,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS present_days,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) AS absent_days,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) AS late_days,
        SUM(CASE WHEN a.status = 'half-day' THEN 1 ELSE 0 END) AS half_days,
        SUM(CASE WHEN a.status = 'leave' THEN 1 ELSE 0 END) AS leave_days,
        COALESCE(ROUND(AVG(
            CASE
                WHEN a.check_in IS NULL OR a.check_out IS NULL THEN NULL
                ELSE TIME_TO_SEC(TIMEDIFF(a.check_out, a.check_in)) / 3600
            END
        ), 2), 0) AS avg_working_hours
    FROM attendance a
    JOIN employee e ON a.employee_id = e.employee_id
    WHERE a.employee_id = p_employee_id
      AND MONTH(a.date) = p_month
      AND YEAR(a.date) = p_year
    GROUP BY e.employee_id, e.name;
END //

DELIMITER ;
