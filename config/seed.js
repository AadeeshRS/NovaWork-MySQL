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
            fs.readFileSync(path.join(__dirname, '../../frontend/json/employees.json'), 'utf8')
        );

        const departmentsData = JSON.parse(
            fs.readFileSync(path.join(__dirname, '../../frontend/json/departments.json'), 'utf8')
        );

        await pool.query('SET FOREIGN_KEY_CHECKS = 0');
        await pool.query('DELETE FROM payroll');
        await pool.query('DELETE FROM leaves');
        await pool.query('DELETE FROM attendance');
        await pool.query('DELETE FROM employee');
        await pool.query('DELETE FROM department');
        await pool.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Cleared existing data\n');

        for (const dept of departmentsData.departments) {
            await pool.query(
                'INSERT INTO department (department_id, name, description, head_of_dept, employee_count, budget, location) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [
                    dept.deptId,
                    dept.deptName,
                    `${dept.deptName} department`,
                    dept.head,
                    dept.employees,
                    dept.budget,
                    'Main Office'
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
                'INSERT INTO employee (employee_id, name, email, password, role, department_id, position, salary, join_date, phone, address, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    emp.employeeId,
                    emp.name,
                    emp.email,
                    hashedPassword,
                    emp.role,
                    deptId,
                    emp.position,
                    emp.salary,
                    emp.joinDate,
                    emp.phone,
                    emp.address,
                    emp.status
                ]
            );
            insertedCount++;
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
