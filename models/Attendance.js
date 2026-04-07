const { getPool } = require('../config/db');

const populateFields = `
    a.id, a.employee_id, a.date, a.status, a.check_in AS checkIn, a.check_out AS checkOut,
    a.working_hours AS workingHours, a.notes, a.created_at AS createdAt, a.updated_at AS updatedAt,
    e.employee_id AS emp_employeeId, e.name AS emp_name, e.email AS emp_email,
    e.department_id AS emp_department, e.position AS emp_position, e.status AS emp_status
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
    date: row.date,
    status: row.status,
    checkIn: row.checkIn,
    checkOut: row.checkOut,
    workingHours: row.workingHours,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
});

const Attendance = {
    async findAll() {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT ${populateFields} FROM attendance a LEFT JOIN employee e ON a.employee_id = e.employee_id ORDER BY a.date DESC`
        );
        return rows.map(mapRow);
    },

    async findByEmployee(employeeId) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT ${populateFields} FROM attendance a LEFT JOIN employee e ON a.employee_id = e.employee_id WHERE a.employee_id = ? ORDER BY a.date DESC`,
            [employeeId]
        );
        return rows.map(mapRow);
    },

    async findByDateRange(startDate, endDate) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT ${populateFields} FROM attendance a LEFT JOIN employee e ON a.employee_id = e.employee_id WHERE a.date >= ? AND a.date <= ? ORDER BY a.date DESC`,
            [startDate, endDate]
        );
        return rows.map(mapRow);
    },

    async findById(id) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT ${populateFields} FROM attendance a LEFT JOIN employee e ON a.employee_id = e.employee_id WHERE a.id = ?`,
            [id]
        );
        if (rows.length === 0) return null;
        return mapRow(rows[0]);
    },

    async create(data) {
        const pool = getPool();
        const [result] = await pool.query(
            'INSERT INTO attendance (employee_id, date, status, check_in, check_out, working_hours, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                data.employee || data.employee_id,
                data.date || new Date(),
                data.status,
                data.checkIn || data.check_in || null,
                data.checkOut || data.check_out || null,
                data.workingHours || data.working_hours || null,
                data.notes || null
            ]
        );
        return this.findById(result.insertId);
    },

    async update(id, data) {
        const pool = getPool();
        const fields = [];
        const values = [];

        if (data.employee !== undefined || data.employee_id !== undefined) { fields.push('employee_id = ?'); values.push(data.employee || data.employee_id); }
        if (data.date !== undefined) { fields.push('date = ?'); values.push(data.date); }
        if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }
        if (data.checkIn !== undefined || data.check_in !== undefined) { fields.push('check_in = ?'); values.push(data.checkIn || data.check_in); }
        if (data.checkOut !== undefined || data.check_out !== undefined) { fields.push('check_out = ?'); values.push(data.checkOut || data.check_out); }
        if (data.workingHours !== undefined || data.working_hours !== undefined) { fields.push('working_hours = ?'); values.push(data.workingHours || data.working_hours); }
        if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes); }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        await pool.query(`UPDATE attendance SET ${fields.join(', ')} WHERE id = ?`, values);
        return this.findById(id);
    },

    async delete(id) {
        const pool = getPool();
        const record = await this.findById(id);
        if (!record) return null;
        await pool.query('DELETE FROM attendance WHERE id = ?', [id]);
        return record;
    }
};

module.exports = Attendance;
