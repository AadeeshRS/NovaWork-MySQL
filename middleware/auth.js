const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    res.redirect('/login');
};


const isAdmin = (req, res, next) => {
    if (req.session && req.session.userId && req.session.role === 'admin') {
        return next();
    }
    res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You do not have permission to access this page',
        layout: 'main'
    });
};


const isEmployee = (req, res, next) => {
    if (req.session && req.session.userId && req.session.role === 'employee') {
        return next();
    }
    res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You do not have permission to access this page',
        layout: 'main'
    });
};

module.exports = {
    isAuthenticated,
    isAdmin,
    isEmployee
};
