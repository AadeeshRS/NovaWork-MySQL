const { getPool } = require('../config/db');

const selectFields = `
    e.employee_id, e.name, e.email, e.role, e.department_id,
    d.name AS department_name, e.position, e.salary,
    e.join_date AS joinDate, e.phone, e.address, e.status,
    e.created_at AS createdAt, e.updated_at AS updatedAt
`;

const selectFieldsWithPassword = `
    e.employee_id, e.name, e.email, e.password, e.role, e.department_id,
    d.name AS department_name, e.position, e.salary,
    e.join_date AS joinDate, e.phone, e.address, e.status,
    e.created_at AS createdAt, e.updated_at AS updatedAt
`;

const fromJoin = `FROM employee e LEFT JOIN department d ON e.department_id = d.department_id`;

function mapRow(row) {
    return {
        ...row,
        salary: parseFloat(row.salary) || 0,
        department: row.department_name || row.department_id,
        _id: row.employee_id,
        employeeId: row.employee_id
    };
}

async function resolveDepartmentId(pool, deptValue) {
    if (!deptValue || deptValue === '') return null;
    if (deptValue.startsWith('DEPT')) return deptValue;
    const [rows] = await pool.query('SELECT department_id FROM department WHERE name = ?', [deptValue]);
    if (rows.length > 0) return rows[0].department_id;
    return deptValue;
}

const Employee = {
    async findAll() {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT ${selectFields} ${fromJoin} ORDER BY e.created_at DESC`
        );
        return rows.map(mapRow);
    },

    async findById(id) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT ${selectFieldsWithPassword} ${fromJoin} WHERE e.employee_id = ?`,
            [id]
        );
        if (rows.length === 0) return null;
        return mapRow(rows[0]);
    },

    async findByIdWithoutPassword(id) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT ${selectFields} ${fromJoin} WHERE e.employee_id = ?`,
            [id]
        );
        if (rows.length === 0) return null;
        return mapRow(rows[0]);
    },

    async findByEmail(email) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT ${selectFieldsWithPassword} ${fromJoin} WHERE e.email = ?`,
            [email.toLowerCase()]
        );
        if (rows.length === 0) return null;
        return mapRow(rows[0]);
    },

    async findByDepartment(dept) {
        const pool = getPool();
        const deptId = await resolveDepartmentId(pool, dept);
        const [rows] = await pool.query(
            `SELECT ${selectFields} ${fromJoin} WHERE e.department_id = ? ORDER BY e.name`,
            [deptId]
        );
        return rows.map(mapRow);
    },

    async create(data) {
        const pool = getPool();
        const deptId = await resolveDepartmentId(pool, data.department || data.department_id);
        await pool.query(
            'INSERT INTO employee (employee_id, name, email, password, role, department_id, position, salary, join_date, phone, address, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                data.employeeId || data.employee_id,
                data.name,
                data.email ? data.email.toLowerCase() : '',
                data.password,
                data.role || 'employee',
                deptId,
                data.position,
                data.salary ? parseFloat(data.salary) : 0,
                data.joinDate || data.join_date || new Date(),
                data.phone || null,
                data.address || null,
                data.status || 'Active'
            ]
        );
        return this.findById(data.employeeId || data.employee_id);
    },

    async update(id, data) {
        const pool = getPool();
        const fields = [];
        const values = [];

        if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
        if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email.toLowerCase()); }
        if (data.password !== undefined) { fields.push('password = ?'); values.push(data.password); }
        if (data.role !== undefined) { fields.push('role = ?'); values.push(data.role); }

        if (data.department !== undefined || data.department_id !== undefined) {
            const raw = data.department !== undefined ? data.department : data.department_id;
            const deptId = await resolveDepartmentId(pool, raw);
            fields.push('department_id = ?');
            values.push(deptId);
        }

        if (data.position !== undefined) { fields.push('position = ?'); values.push(data.position); }
        if (data.salary !== undefined) { fields.push('salary = ?'); values.push(data.salary === '' ? 0 : parseFloat(data.salary)); }
        if (data.joinDate !== undefined || data.join_date !== undefined) { fields.push('join_date = ?'); values.push(data.joinDate || data.join_date); }
        if (data.phone !== undefined) { fields.push('phone = ?'); values.push(data.phone); }
        if (data.address !== undefined) { fields.push('address = ?'); values.push(data.address); }
        if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        await pool.query(`UPDATE employee SET ${fields.join(', ')} WHERE employee_id = ?`, values);
        return this.findById(id);
    },

    async delete(id) {
        const pool = getPool();
        const employee = await this.findById(id);
        if (!employee) return null;
        await pool.query('DELETE FROM employee WHERE employee_id = ?', [id]);
        return employee;
    }
};

module.exports = Employee;
