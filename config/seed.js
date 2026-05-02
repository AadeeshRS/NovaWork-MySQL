require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { initializeDB, getPool } = require('./db');

const seedData = async () => {
    try {
        await initializeDB();
        const pool = getPool();

        console.log('Starting data seeding...\n');

        const employeesData = JSON.parse(
            fs.readFileSync(path.join(__dirname, '../public/json/employees.json'), 'utf8')
        );

        const departmentsData = JSON.parse(
            fs.readFileSync(path.join(__dirname, '../public/json/departments.json'), 'utf8')
        );

        await pool.query('SET FOREIGN_KEY_CHECKS = 0');
        await pool.query('DELETE FROM audit_logs');
        await pool.query('DELETE FROM payroll');
        await pool.query('DELETE FROM leaves');
        await pool.query('DELETE FROM attendance');
        await pool.query('UPDATE department SET manager_id = NULL');
        await pool.query('DELETE FROM employee');
        await pool.query('DELETE FROM department');
        await pool.query('DELETE FROM positions');
        await pool.query("DELETE FROM locations WHERE name <> 'Main Office'");
        await pool.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Cleared existing data\n');

        await pool.query(`
            INSERT INTO locations (name, address, city, state, country)
            VALUES ('Main Office', 'NovaWork Main Office', 'Gurugram', 'Haryana', 'India')
            ON DUPLICATE KEY UPDATE name = VALUES(name)
        `);
        const [[mainOffice]] = await pool.query('SELECT location_id FROM locations WHERE name = ?', ['Main Office']);

        for (const dept of departmentsData.departments) {
            await pool.query(
                'INSERT INTO department (department_id, name, description, manager_id, budget, location_id) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    dept.deptId,
                    dept.deptName,
                    `${dept.deptName} department`,
                    null,
                    dept.budget,
                    mainOffice.location_id
                ]
            );
        }
        console.log(`Inserted ${departmentsData.departments.length} departments`);

        const employees = employeesData.employees.map(emp => ({
            employeeId: emp.id,
            name: emp.name,
            email: `${emp.id.toLowerCase()}@novawork.com`,
            password: 'password123',
            role: 'employee',
            department: emp.department,
            position: emp.designation,
            salary: emp.salary,
            joinDate: emp.joiningDate,
            phone: `+91 ${Math.floor(1000000000 + Math.random() * 9000000000)}`,
            address: 'Gurugram, Haryana',
            status: emp.status
        }));

        const adminUser = {
            employeeId: 'ADMIN001',
            name: 'Admin User',
            email: 'admin@novawork.com',
            password: 'admin123',
            role: 'admin',
            department: null,
            position: 'System Administrator',
            salary: 1500000,
            joinDate: '2024-01-01',
            phone: '+91 9876543210',
            address: 'Gurugram, Haryana',
            status: 'Active'
        };

        employees.push(adminUser);

        let insertedCount = 0;
        for (const emp of employees) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(emp.password, salt);

            const deptId = emp.department ? departmentsData.departments.find(d => d.deptName === emp.department)?.deptId || null : null;
            await pool.query(
                'INSERT INTO positions (title) VALUES (?) ON DUPLICATE KEY UPDATE title = VALUES(title)',
                [emp.position]
            );
            const [[position]] = await pool.query('SELECT position_id FROM positions WHERE title = ?', [emp.position]);
            const [[role]] = await pool.query('SELECT role_id FROM roles WHERE name = ?', [emp.role]);

            await pool.query(
                'INSERT INTO employee (employee_id, name, email, password, role_id, department_id, position_id, salary, join_date, phone, address, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    emp.employeeId,
                    emp.name,
                    emp.email,
                    hashedPassword,
                    role.role_id,
                    deptId,
                    position.position_id,
                    emp.salary,
                    emp.joinDate,
                    emp.phone,
                    emp.address,
                    emp.status
                ]
            );
            insertedCount++;
        }

        for (const dept of departmentsData.departments) {
            const [[manager]] = await pool.query('SELECT employee_id FROM employee WHERE name = ? LIMIT 1', [dept.head]);
            if (manager) {
                await pool.query('UPDATE department SET manager_id = ? WHERE department_id = ?', [manager.employee_id, dept.deptId]);
            }
        }

        console.log(`Inserted ${insertedCount} employees (including 1 admin)\n`);

        console.log('Data seeding completed successfully!');
        console.log('\nSummary:');
        console.log(`   Departments: ${departmentsData.departments.length}`);
        console.log(`   Employees: ${insertedCount}`);
        console.log('\nLogin Credentials:');
        console.log('   Admin:');
        console.log('      Email: admin@novawork.com');
        console.log('      Password: admin123');
        console.log('   Employee (example):');
        console.log('      Email: emp001@novawork.com');
        console.log('      Password: password123');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
