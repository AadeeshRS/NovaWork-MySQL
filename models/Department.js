const { getPool } = require('../config/db');

function mapRow(row) {
    return {
        ...row,
        departmentId: row.department_id,
        deptId: row.department_id,
        deptName: row.name,
        headOfDepartment: row.head_of_dept,
        head: row.head_of_dept,
        employeeCount: parseInt(row.employee_count) || 0,
        employees: parseInt(row.employee_count) || 0,
        budget: row.budget ? parseFloat(row.budget) : 0,
        _id: row.department_id,
        id: row.department_id
    };
}

const Department = {
    async findAll() {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT department_id, name, description, head_of_dept, employee_count, budget, location, created_at, updated_at FROM department ORDER BY name'
        );
        return rows.map(mapRow);
    },

    async findById(id) {
        const pool = getPool();
        const [rows] = await pool.query(
            'SELECT department_id, name, description, head_of_dept, employee_count, budget, location, created_at, updated_at FROM department WHERE department_id = ?',
            [id]
        );
        if (rows.length === 0) return null;
        return mapRow(rows[0]);
    },

    async create(data) {
        const pool = getPool();
        const id = data.departmentId || data.deptId || data.department_id || `DEPT${String(Date.now()).slice(-6)}`;
        await pool.query(
            'INSERT INTO department (department_id, name, description, head_of_dept, employee_count, budget, location) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                id,
                data.name || data.deptName,
                data.description || null,
                data.headOfDepartment || data.head || data.head_of_dept || null,
                data.employees || data.employeeCount || data.employee_count ? parseInt(data.employees || data.employeeCount || data.employee_count) : 0,
                data.budget && data.budget !== '' ? parseFloat(data.budget) : null,
                data.location || null
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

        const head = data.headOfDepartment !== undefined ? data.headOfDepartment : (data.head !== undefined ? data.head : data.head_of_dept);
        if (head !== undefined) { fields.push('head_of_dept = ?'); values.push(head); }

        const empCount = data.employees !== undefined ? data.employees : (data.employeeCount !== undefined ? data.employeeCount : data.employee_count);
        if (empCount !== undefined) {
            fields.push('employee_count = ?');
            values.push(empCount === '' ? 0 : parseInt(empCount));
        }

        if (data.budget !== undefined) {
            fields.push('budget = ?');
            values.push(data.budget === '' ? null : parseFloat(data.budget));
        }

        if (data.location !== undefined) { fields.push('location = ?'); values.push(data.location); }

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
