const { getPool } = require('../config/db');

const netSalaryExpression = '(p.base_salary + p.allowances + p.bonuses - p.deductions - p.tax)';

const populateFields = `
    p.id, p.employee_id, p.month, p.year, p.base_salary AS baseSalary,
    p.allowances, p.bonuses, p.deductions, p.tax, ${netSalaryExpression} AS netSalary,
    p.payment_date AS paymentDate, p.status, p.created_at AS createdAt, p.updated_at AS updatedAt,
    e.employee_id AS emp_employeeId, e.name AS emp_name, e.email AS emp_email,
    e.department_id AS emp_department, pos.title AS emp_position, e.status AS emp_status
`;

const mapRow = (row) => ({
    _id: String(row.id),
    id: String(row.id),
    employee: row.emp_employeeId ? {
        _id: row.emp_employeeId,
        employeeId: row.emp_employeeId,
        name: row.emp_name,
        email: row.emp_email,
        department: row.emp_department,
        position: row.emp_position,
        status: row.emp_status
    } : row.employee_id,
    month: row.month,
    year: row.year,
    baseSalary: parseFloat(row.baseSalary) || 0,
    allowances: parseFloat(row.allowances) || 0,
    bonuses: parseFloat(row.bonuses) || 0,
    deductions: parseFloat(row.deductions) || 0,
    tax: parseFloat(row.tax) || 0,
    netSalary: parseFloat(row.netSalary) || 0,
    paymentDate: row.paymentDate,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
});

const fromJoin = `
    FROM payroll p
    LEFT JOIN employee e ON p.employee_id = e.employee_id
    LEFT JOIN positions pos ON e.position_id = pos.position_id
`;

const Payroll = {
    async findAll() {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT ${populateFields} ${fromJoin} ORDER BY p.year DESC, p.month DESC`
        );
        return rows.map(mapRow);
    },

    async findByEmployee(employeeId) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT ${populateFields} ${fromJoin} WHERE p.employee_id = ? ORDER BY p.year DESC, p.month DESC`,
            [employeeId]
        );
        return rows.map(mapRow);
    },

    async findById(id) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT ${populateFields} ${fromJoin} WHERE p.id = ?`,
            [id]
        );
        if (rows.length === 0) return null;
        return mapRow(rows[0]);
    },

    async create(data) {
        const pool = getPool();
        const [result] = await pool.query(
            'INSERT INTO payroll (employee_id, month, year, base_salary, allowances, bonuses, deductions, tax, payment_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                data.employee || data.employee_id,
                data.month,
                data.year,
                data.baseSalary || data.base_salary,
                data.allowances || 0,
                data.bonuses || 0,
                data.deductions || 0,
                data.tax || 0,
                data.paymentDate || data.payment_date || null,
                data.status || 'pending'
            ]
        );
        return this.findById(result.insertId);
    },

    async update(id, data) {
        const pool = getPool();
        const fields = [];
        const values = [];

        if (data.employee !== undefined || data.employee_id !== undefined) { fields.push('employee_id = ?'); values.push(data.employee || data.employee_id); }
        if (data.month !== undefined) { fields.push('month = ?'); values.push(data.month); }
        if (data.year !== undefined) { fields.push('year = ?'); values.push(data.year); }
        if (data.baseSalary !== undefined || data.base_salary !== undefined) { fields.push('base_salary = ?'); values.push(data.baseSalary || data.base_salary); }
        if (data.allowances !== undefined) { fields.push('allowances = ?'); values.push(data.allowances); }
        if (data.bonuses !== undefined) { fields.push('bonuses = ?'); values.push(data.bonuses); }
        if (data.deductions !== undefined) { fields.push('deductions = ?'); values.push(data.deductions); }
        if (data.tax !== undefined) { fields.push('tax = ?'); values.push(data.tax); }
        if (data.paymentDate !== undefined || data.payment_date !== undefined) { fields.push('payment_date = ?'); values.push(data.paymentDate || data.payment_date); }
        if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        await pool.query(`UPDATE payroll SET ${fields.join(', ')} WHERE id = ?`, values);
        return this.findById(id);
    },

    async delete(id) {
        const pool = getPool();
        const record = await this.findById(id);
        if (!record) return null;
        await pool.query('DELETE FROM payroll WHERE id = ?', [id]);
        return record;
    }
};

module.exports = Payroll;
