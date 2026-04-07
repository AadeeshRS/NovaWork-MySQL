const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { isAuthenticated, isEmployee } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

router.get('/me', isAuthenticated, isEmployee, async (req, res) => {
    try {
        const employee = await Employee.findByIdWithoutPassword(req.session.userId);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }
        res.json({
            success: true,
            data: employee
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching employee data',
            error: error.message
        });
    }
});

router.put('/me', isAuthenticated, isEmployee, async (req, res) => {
    try {
        const { name, email, phone, address } = req.body;

        const employee = await Employee.findById(req.session.userId);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (address) updateData.address = address;

        const updated = await Employee.update(req.session.userId, updateData);

        req.session.name = updated.name;
        req.session.email = updated.email;

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: updated
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
});

router.post('/change-password', isAuthenticated, isEmployee, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both current and new password'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        const employee = await Employee.findById(req.session.userId);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, employee.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await Employee.update(req.session.userId, { password: hashedPassword });

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error changing password',
            error: error.message
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const employees = await Employee.findAll();
        res.json({
            success: true,
            count: employees.length,
            data: employees
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching employees',
            error: error.message
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }
        res.json({
            success: true,
            data: employee
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching employee',
            error: error.message
        });
    }
});

router.get('/department/:dept', async (req, res) => {
    try {
        const employees = await Employee.findByDepartment(req.params.dept);
        res.json({
            success: true,
            count: employees.length,
            data: employees
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching employees',
            error: error.message
        });
    }
});

router.post('/', async (req, res) => {
    try {
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }
        const employee = await Employee.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: employee
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating employee',
            error: error.message
        });
    }
});

router.put('/:id', async (req, res) => {
    try {
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        }
        const employee = await Employee.update(req.params.id, req.body);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }
        res.json({
            success: true,
            message: 'Employee updated successfully',
            data: employee
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating employee',
            error: error.message
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const employee = await Employee.delete(req.params.id);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }
        res.json({
            success: true,
            message: 'Employee deleted successfully',
            data: employee
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting employee',
            error: error.message
        });
    }
});

module.exports = router;
