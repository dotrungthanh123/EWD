const checkLoginSession = (req, res, next) => {
    if (req.session.username) {
        next();
    } else {
        res.redirect('/auth/login');
    }
}

const checkMktManagerSession = (req, res, next) => {
    if (req.session.username && req.session.role === 'mktManager') {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

const checkMktCoordinatorSession = (req, res, next) => {
    if (req.session.username && req.session.role === 'mktCoordinator') {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

const checkStudentSession = (req, res, next) => {
    if (req.session.username && req.session.role === 'student') {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

const checkGuestSession = (req, res, next) => {
    if (req.session.username && req.session.role === 'guest') {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

const checkAdminSession = (req, res, next) => {
    if (req.session.username && req.session.role === 'admin') {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

module.exports = {
    checkLoginSession,
    checkMktManagerSession,
    checkMktCoordinatorSession,
    checkStudentSession,
    checkGuestSession,
    checkAdminSession
};
