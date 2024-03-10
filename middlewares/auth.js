const checkLoginSession = (req, res, next) => {
    if (req.session.username) {
        next();
    } else {
        res.redirect('/auth/login');
    }
}

const checkMktCoordinatorITSession = (req, res, next) => {
    if (req.session.username && req.session.role === 'mktCoordinatorIT') {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

const checkMktCoordinatorDesignSession = (req, res, next) => {
    if (req.session.username && req.session.role === 'mktCoordinatorDesign') {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

const checkMktCoordinatorBusinessSession = (req, res, next) => {
    if (req.session.username && req.session.role === 'mktCoordinatorBusiness') {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

const checkStudentITSession = (req, res, next) => {
    if (req.session.username && req.session.role === 'studentIT') {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

const checkStudentDesignSession = (req, res, next) => {
    if (req.session.username && req.session.role === 'studentDesign') {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

const checkStudentBusinessSession = (req, res, next) => {
    if (req.session.username && req.session.role === 'studentBusiness') {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

const checkGuestITSession = (req, res, next) => {
    if (req.session.username && req.session.role === 'guestIT') {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

const checkGuestDesignSession = (req, res, next) => {
    if (req.session.username && req.session.role === 'guestDesign') {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

const checkGuestBusinessSession = (req, res, next) => {
    if (req.session.username && req.session.role === 'guestBusiness') {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

const checkMktManagerSession = (req, res, next) => {
    if (req.session.username && req.session.role === 'mktManager') {
        next();
    } else {
        res.redirect('/auth/login');
    }
};

module.exports = {
    checkLoginSession,
    checkMktManagerSession,
    checkMktCoordinatorITSession,
    checkMktCoordinatorDesignSession,
    checkMktCoordinatorBusinessSession,
    checkStudentITSession,
    checkStudentDesignSession,
    checkStudentBusinessSession,
    checkGuestITSession,
    checkGuestDesignSession,
    checkGuestBusinessSession
};
