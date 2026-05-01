const { getPool } = require('../config/db');

const populateFields = `
    l.id, l.employee_id, l.applied_date AS appliedDate, l.leave_type AS leaveType,
    l.start_date AS startDate, l.end_date AS endDate, DATEDIFF(l.end_date, l.start_date) + 1 AS days,
    l.reason, l.status, l.approved_by AS approvedBy, approver.name AS approvedByName,
    l.approved_date AS approvedDate, l.rejection_reason AS rejectionReason,
    l.created_at AS createdAt, l.updated_at AS updatedAt,
    e.employee_id AS emp_employeeId, e.name AS emp_name, e.email AS emp_email,
    e.department_id AS emp_department, pos.title AS emp_position, e.status AS emp_status
`;

const fromJoin = `
    FROM leaves l
    LEFT JOIN employee e ON l.employee_id = e.employee_id
    LEFT JOIN positions pos ON e.position_id = pos.position_id
    LEFT JOIN employee approver ON l.approved_by = approver.employee_id
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
    appliedDate: row.appliedDate,
    leaveType: row.leaveType,
    startDate: row.startDate,
    endDate: row.endDate,
    days: parseInt(row.days) || 0,
    reason: row.reason,
    status: row.status,
    approvedBy: row.approvedBy,
    approvedByName: row.approvedByName,
    approvedDate: row.approvedDate,
    rejectionReason: row.rejectionReason,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
});

async function resolveApproverId(pool, value) {
    if (!value || value === '') return null;
    if (String(value).startsWith('EMP') || String(value).startsWith('ADMIN')) return value;

    const [byName] = await pool.query('SELECT employee_id FROM employee WHERE name = ? LIMIT 1', [value]);
    if (byName.length > 0) return byName[0].employee_id;

    if (String(value).toLowerCase() === 'admin') {
        const [admins] = await pool.query(`
            SELECT e.employee_id
            FROM employee e
            JOIN roles r ON e.role_id = r.role_id
            WHERE r.name = 'admin'
            ORDER BY e.created_at
            LIMIT 1
        `);
        if (admins.length > 0) return admins[0].employee_id;
    }

    return value;
}

const Leave = {
    async findAll() {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT ${populateFields} ${fromJoin} ORDER BY l.applied_date DESC`
        );
        return rows.map(mapRow);
    },

    async findByEmployee(employeeId) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT ${populateFields} ${fromJoin} WHERE l.employee_id = ? ORDER BY l.applied_date DESC`,
            [employeeId]
        );
        return rows.map(mapRow);
    },

    async findByStatus(status) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT ${populateFields} ${fromJoin} WHERE l.status = ? ORDER BY l.applied_date DESC`,
            [status]
        );
        return rows.map(mapRow);
    },

    async findById(id) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT ${populateFields} ${fromJoin} WHERE l.id = ?`,
            [id]
        );
        if (rows.length === 0) return null;
        return mapRow(rows[0]);
    },

    async create(data) {
        const pool = getPool();
        const appliedDate = data.appliedDate || data.applied_date || new Date().toISOString().split('T')[0];
        const startDate = data.startDate || data.start_date;
        const endDate = data.endDate || data.end_date;
        const approvedDate = data.approvedDate || data.approved_date;

        const [result] = await pool.query(
            'INSERT INTO leaves (employee_id, applied_date, leave_type, start_date, end_date, reason, status, approved_by, approved_date, rejection_reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                data.employee || data.employee_id,
                typeof appliedDate === 'string' ? appliedDate.split('T')[0] : appliedDate,
                data.leaveType || data.leave_type,
                typeof startDate === 'string' ? startDate.split('T')[0] : startDate,
                typeof endDate === 'string' ? endDate.split('T')[0] : endDate,
                data.reason,
                data.status || 'pending',
                await resolveApproverId(pool, data.approvedBy || data.approved_by),
                approvedDate ? (typeof approvedDate === 'string' ? approvedDate.split('T')[0] : approvedDate) : null,
                data.rejectionReason || data.rejection_reason || null
            ]
        );
        return this.findById(result.insertId);
    },

    async update(id, data) {
        const pool = getPool();
        const fields = [];
        const values = [];

        if (data.employee !== undefined || data.employee_id !== undefined) { fields.push('employee_id = ?'); values.push(data.employee || data.employee_id); }
        if (data.leaveType !== undefined || data.leave_type !== undefined) { fields.push('leave_type = ?'); values.push(data.leaveType || data.leave_type); }
        if (data.startDate !== undefined || data.start_date !== undefined) {
            fields.push('start_date = ?');
            const d = data.startDate || data.start_date;
            values.push(typeof d === 'string' ? d.split('T')[0] : d);
        }
        if (data.endDate !== undefined || data.end_date !== undefined) {
            fields.push('end_date = ?');
            const d = data.endDate || data.end_date;
            values.push(typeof d === 'string' ? d.split('T')[0] : d);
        }
        if (data.reason !== undefined) { fields.push('reason = ?'); values.push(data.reason); }
        if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
        if (data.approvedBy !== undefined || data.approved_by !== undefined) {
            fields.push('approved_by = ?');
            values.push(await resolveApproverId(pool, data.approvedBy || data.approved_by));
        }
        if (data.approvedDate !== undefined || data.approved_date !== undefined) {
            fields.push('approved_date = ?');
            const d = data.approvedDate || data.approved_date;
            values.push(d ? (typeof d === 'string' ? d.split('T')[0] : d) : null);
        }
        if (data.rejectionReason !== undefined || data.rejection_reason !== undefined) { fields.push('rejection_reason = ?'); values.push(data.rejectionReason || data.rejection_reason); }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        await pool.query(`UPDATE leaves SET ${fields.join(', ')} WHERE id = ?`, values);
        return this.findById(id);
    },

    async delete(id) {
        const pool = getPool();
        const record = await this.findById(id);
        if (!record) return null;
        await pool.query('DELETE FROM leaves WHERE id = ?', [id]);
        return record;
    }
};

module.exports = Leave;
