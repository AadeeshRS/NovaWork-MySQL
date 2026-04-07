const express = require('express');
const router = express.Router();
const Payroll = require('../models/Payroll');

router.get('/', async (req, res) => {
    try {
        const payroll = await Payroll.findAll();
        res.json({
            success: true,
            count: payroll.length,
            data: payroll
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching payroll',
            error: error.message
        });
    }
});

router.get('/employee/:employeeId', async (req, res) => {
    try {
        const payroll = await Payroll.findByEmployee(req.params.employeeId);
        res.json({
            success: true,
            count: payroll.length,
            data: payroll
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching payroll',
            error: error.message
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const payroll = await Payroll.findById(req.params.id);
        if (!payroll) {
            return res.status(404).json({
                success: false,
                message: 'Payroll record not found'
            });
        }
        res.json({
            success: true,
            data: payroll
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching payroll',
            error: error.message
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const payroll = await Payroll.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Payroll created successfully',
            data: payroll
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating payroll',
            error: error.message
        });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const payroll = await Payroll.update(req.params.id, req.body);
        if (!payroll) {
            return res.status(404).json({
                success: false,
                message: 'Payroll record not found'
            });
        }
        res.json({
            success: true,
            message: 'Payroll updated successfully',
            data: payroll
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating payroll',
            error: error.message
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const payroll = await Payroll.delete(req.params.id);
        if (!payroll) {
            return res.status(404).json({
                success: false,
                message: 'Payroll record not found'
            });
        }
        res.json({
            success: true,
            message: 'Payroll deleted successfully',
            data: payroll
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting payroll',
            error: error.message
        });
    }
});

module.exports = router;
