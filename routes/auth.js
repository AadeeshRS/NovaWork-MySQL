const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const employee = await Employee.findByEmail(email.toLowerCase());

        if (!employee) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const isMatch = await bcrypt.compare(password, employee.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        req.session.userId = employee.employee_id;
        req.session.employeeId = employee.employee_id;
        req.session.name = employee.name;
        req.session.email = employee.email;
        req.session.role = employee.role || 'employee';
        req.session.department = employee.department;
        req.session.position = employee.position;

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: employee.employee_id,
                employeeId: employee.employee_id,
                name: employee.name,
                email: employee.email,
                role: employee.role || 'employee',
                department: employee.department,
                position: employee.position
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Error logging out'
            });
        }
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    });
});

router.get('/check', (req, res) => {
    if (req.session.userId) {
        res.json({
            success: true,
            loggedIn: true,
            user: {
                id: req.session.userId,
                employeeId: req.session.employeeId,
                name: req.session.name,
                email: req.session.email,
                role: req.session.role,
                department: req.session.department,
                position: req.session.position
            }
        });
    } else {
        res.json({
            success: true,
            loggedIn: false
        });
    }
});

module.exports = router;
