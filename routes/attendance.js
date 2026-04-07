const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

router.get('/', async (req, res) => {
    try {
        const attendance = await Attendance.findAll();
        res.json({
            success: true,
            count: attendance.length,
            data: attendance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance',
            error: error.message
        });
    }
});

router.get('/employee/:employeeId', async (req, res) => {
    try {
        const attendance = await Attendance.findByEmployee(req.params.employeeId);
        res.json({
            success: true,
            count: attendance.length,
            data: attendance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance',
            error: error.message
        });
    }
});

router.get('/date-range', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const attendance = await Attendance.findByDateRange(startDate, endDate);
        res.json({
            success: true,
            count: attendance.length,
            data: attendance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance',
            error: error.message
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const attendance = await Attendance.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Attendance marked successfully',
            data: attendance
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error marking attendance',
            error: error.message
        });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const attendance = await Attendance.update(req.params.id, req.body);
        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: 'Attendance record not found'
            });
        }
        res.json({
            success: true,
            message: 'Attendance updated successfully',
            data: attendance
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating attendance',
            error: error.message
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const attendance = await Attendance.delete(req.params.id);
        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: 'Attendance record not found'
            });
        }
        res.json({
            success: true,
            message: 'Attendance deleted successfully',
            data: attendance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting attendance',
            error: error.message
        });
    }
});

module.exports = router;
