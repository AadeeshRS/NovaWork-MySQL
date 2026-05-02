const { getPool } = require('../config/db');

const selectFields = `
    d.department_id, d.name, d.description, d.manager_id, m.name AS manager_name,
    COUNT(e.employee_id) AS employee_count, d.budget, d.location_id, l.name AS location,
    d.created_at, d.updated_at
`;

const fromJoin = `
    FROM department d
    LEFT JOIN employee m ON d.manager_id = m.employee_id
    LEFT JOIN employee e ON d.department_id = e.department_id
    LEFT JOIN locations l ON d.location_id = l.location_id
`;

function mapRow(row) {
    return {
        ...row,
        departmentId: row.department_id,
        deptId: row.department_id,
        deptName: row.name,
        managerId: row.manager_id,
        headOfDepartment: row.manager_name || row.manager_id,
        head: row.manager_name || row.manager_id,
        employeeCount: parseInt(row.employee_count) || 0,
        employees: parseInt(row.employee_count) || 0,
        budget: row.budget ? parseFloat(row.budget) : 0,
        _id: row.department_id,
        id: row.department_id
    };
}

async function resolveEmployeeId(pool, value) {
    if (!value || value === '') return null;
    const strVal = String(value);
    // Try direct employee_id lookup first
    const [byId] = await pool.query('SELECT employee_id FROM employee WHERE employee_id = ? LIMIT 1', [strVal]);
    if (byId.length > 0) return byId[0].employee_id;
    // Try by name
    const [byName] = await pool.query('SELECT employee_id FROM employee WHERE name = ? LIMIT 1', [strVal]);
    // Return null if not found — never return raw string (causes FK violation)
    return byName.length > 0 ? byName[0].employee_id : null;
}

async function resolveLocationId(pool, value = 'Main Office') {
    if (!value || value === '') return null;
    if (Number.isInteger(value)) return value;
    if (/^\d+$/.test(String(value))) return Number(value);

    await pool.query(
        'INSERT INTO locations (name) VALUES (?) ON DUPLICATE KEY UPDATE name = VALUES(name)',
        [value]
    );
    const [rows] = await pool.query('SELECT location_id FROM locations WHERE name = ?', [value]);
    return rows[0].location_id;
}

const Department = {
    async findAll() {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT ${selectFields} ${fromJoin}
             GROUP BY d.department_id, d.name, d.description, d.manager_id, m.name, d.budget, d.location_id, l.name, d.created_at, d.updated_at
             ORDER BY d.name`
        );
        return rows.map(mapRow);
    },

    async findById(id) {
        const pool = getPool();
        const [rows] = await pool.query(
            `SELECT ${selectFields} ${fromJoin}
             WHERE d.department_id = ?
             GROUP BY d.department_id, d.name, d.description, d.manager_id, m.name, d.budget, d.location_id, l.name, d.created_at, d.updated_at`,
            [id]
        );
        if (rows.length === 0) return null;
        return mapRow(rows[0]);
    },

    async create(data) {
        const pool = getPool();
        const id = data.departmentId || data.deptId || data.department_id || `DEPT${String(Date.now()).slice(-6)}`;
        const managerId = await resolveEmployeeId(pool, data.managerId || data.manager_id || data.headOfDepartment || data.head || data.head_of_dept);
        const locationId = await resolveLocationId(pool, data.location_id || data.location || 'Main Office');

        await pool.query(
            'INSERT INTO department (department_id, name, description, manager_id, budget, location_id) VALUES (?, ?, ?, ?, ?, ?)',
            [
                id,
                data.name || data.deptName,
                data.description || null,
                managerId,
                data.budget && data.budget !== '' ? parseFloat(data.budget) : null,
                locationId
            ]
        );
        return this.findById(id);
    },

    async update(id, data) {
        const pool = getPool();
        const fields = [];
        const values = [];

        const name = data.name !== undefined ? data.name : data.deptName;
        if (name !== undefined) { fields.push('name = ?'); values.push(name); }

        if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }

        const head = data.managerId !== undefined ? data.managerId
            : data.manager_id !== undefined ? data.manager_id
                : data.headOfDepartment !== undefined ? data.headOfDepartment
                    : data.head !== undefined ? data.head : data.head_of_dept;
        if (head !== undefined) {
            fields.push('manager_id = ?');
            values.push(await resolveEmployeeId(pool, head));
        }

        if (data.budget !== undefined) {
            fields.push('budget = ?');
            values.push(data.budget === '' ? null : parseFloat(data.budget));
        }

        if (data.location !== undefined || data.location_id !== undefined) {
            fields.push('location_id = ?');
            values.push(await resolveLocationId(pool, data.location_id || data.location));
        }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        await pool.query(`UPDATE department SET ${fields.join(', ')} WHERE department_id = ?`, values);
        return this.findById(id);
    },

    async delete(id) {
        const pool = getPool();
        const department = await this.findById(id);
        if (!department) return null;
        await pool.query('DELETE FROM department WHERE department_id = ?', [id]);
        return department;
    }
};

module.exports = Department;
