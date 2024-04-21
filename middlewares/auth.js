const checkLoginSession = (req, res, next) => {
    if (req.session.username) {
        next();
    } else {
        res.redirect('/auth/login');
    }
}

const checkMktManagerSession = (req, res, next) => {
    if (req.session.username && req.session.role === 'MktManager') {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

const checkMktCoordinatorSession = (req, res, next) => {
    if (req.session.username && req.session.role === 'MktCoordinator') {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

const checkStudentSession = (req, res, next) => {
    if (req.session.username && req.session.role === 'Student') {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

const checkGuestSession = (req, res, next) => {
    if (req.session.username && req.session.role === 'Guest') {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

const checkAdminSession = (req, res, next) => {
    if (req.session.username && req.session.role === 'Admin') {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

const checkNotLoggedIn = (req, res, next) => {
    if (req.session.username) { 
        res.redirect('/'); 
    } else {
        next();
    }
};

module.exports = {
    checkLoginSession,
    checkMktManagerSession,
    checkMktCoordinatorSession,
    checkStudentSession,
    checkGuestSession,
    checkAdminSession,
    checkNotLoggedIn
};
