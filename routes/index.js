const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin, isEmployee } = require('../middleware/auth');


router.get('/', (req, res) => {
    res.render('home', {
        title: 'Home - NovaWork',
        layout: 'main'
    });
});

router.get('/about', (req, res) => {
    res.render('about', {
        title: 'About - NovaWork',
        layout: 'main'
    });
});

router.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Contact - NovaWork',
        layout: 'main'
    });
});

router.get('/login', (req, res) => {
    res.render('login', {
        title: 'Login - NovaWork',
        layout: 'main'
    });
});

router.get('/admin-dashboard', isAuthenticated, isAdmin, (req, res) => {
    res.render('admin-dashboard', {
        title: 'Admin Dashboard - NovaWork',
        layout: 'main',
        isDashboard: true
    });
});

router.get('/admin-employees', isAuthenticated, isAdmin, (req, res) => {
    res.render('admin-employees', {
        title: 'Employees - NovaWork',
        layout: 'main',
        isEmployees: true
    });
});

router.get('/admin-departments', isAuthenticated, isAdmin, (req, res) => {
    res.render('admin-departments', {
        title: 'Departments - NovaWork',
        layout: 'main',
        isDepartments: true
    });
});

router.get('/admin-attendance', isAuthenticated, isAdmin, (req, res) => {
    res.render('admin-attendance', {
        title: 'Attendance - NovaWork',
        layout: 'main',
        isAttendance: true
    });
});

router.get('/admin-payroll', isAuthenticated, isAdmin, (req, res) => {
    res.render('admin-payroll', {
        title: 'Payroll - NovaWork',
        layout: 'main',
        isPayroll: true
    });
});

router.get('/admin-leaves', isAuthenticated, isAdmin, (req, res) => {
    res.render('admin-leaves', {
        title: 'Leave Management - NovaWork',
        layout: 'main',
        isLeaves: true
    });
});

router.get('/admin-reports', isAuthenticated, isAdmin, (req, res) => {
    res.render('admin-reports', {
        title: 'Reports - NovaWork',
        layout: 'main'
    });
});


router.get('/employee-dashboard', isAuthenticated, isEmployee, (req, res) => {
    res.render('employee-dashboard', {
        title: 'Employee Dashboard - NovaWork',
        layout: 'main',
        isDashboard: true,
        user: {
            id: req.session.userId,
            employeeId: req.session.employeeId,
            name: req.session.name,
            email: req.session.email,
            department: req.session.department,
            position: req.session.position
        }
    });
});

router.get('/employee-attendance', isAuthenticated, isEmployee, (req, res) => {
    res.render('employee-attendance', {
        title: 'My Attendance - NovaWork',
        layout: 'main',
        isAttendance: true,
        user: {
            id: req.session.userId,
            employeeId: req.session.employeeId,
            name: req.session.name,
            email: req.session.email,
            department: req.session.department,
            position: req.session.position
        }
    });
});

router.get('/employee-payslips', isAuthenticated, isEmployee, (req, res) => {
    res.render('employee-payslips', {
        title: 'My Payslips - NovaWork',
        layout: 'main',
        isPayslips: true,
        user: {
            id: req.session.userId,
            employeeId: req.session.employeeId,
            name: req.session.name,
            email: req.session.email,
            department: req.session.department,
            position: req.session.position
        }
    });
});

router.get('/employee-profile', isAuthenticated, isEmployee, (req, res) => {
    res.render('employee-profile', {
        title: 'My Profile - NovaWork',
        layout: 'main',
        isProfile: true,
        user: {
            id: req.session.userId,
            employeeId: req.session.employeeId,
            name: req.session.name,
            email: req.session.email,
            department: req.session.department,
            position: req.session.position
        }
    });
});

router.get('/employee-leave', isAuthenticated, isEmployee, (req, res) => {
    res.render('employee-leave', {
        title: 'Leave Request - NovaWork',
        layout: 'main',
        isLeave: true,
        user: {
            id: req.session.userId,
            employeeId: req.session.employeeId,
            name: req.session.name,
            email: req.session.email,
            department: req.session.department,
            position: req.session.position
        }
    });
});

module.exports = router;
