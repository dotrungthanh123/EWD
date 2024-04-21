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

const checkNotLoggedIn = (req, res, next) => {
    if (req.session.username) { 
        res.redirect('/');
        console.log('nigga')
    } else {
        next();
    }
};

const checkStudentOrMktCoordinatorSession = (req, res, next) => {
    const userRole = req.session.role;
    console.log("Session Role:", userRole); // Check role value

    if (userRole === 'student' || userRole === 'mktCoordinator') {
        return next(); // Should continue if role matches
    }

    // If not authorized, redirect or send a response
    console.log("Unauthorized access attempt"); // Log unauthorized access
    return res.status(403).send('Unauthorized access');S
};

const checkRoles = (allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.session.role?.name; // Safely access the role name

        if (allowedRoles.includes(userRole)) {
        return next(); // Continue if the user has an allowed role
        }

        return res.status(403).send('Unauthorized access'); // Otherwise, deny access
    };
};

const checkMultipleSession = (allowedRoles) => (req, res, next) => {
    if (req.session.username && allowedRoles.includes(req.session.role)) {
        next();
    } else {
        res.redirect('/auth/login');
    }
}

// const checkMultipleSession = (allowedRoles) => (req, res, next) => {
//     const { username, role } = req.session;

//     // Check if the user is logged in and if their role is in the allowedRoles
//     if (username && allowedRoles.includes(role)) {
//         return next(); // Allow access to the route
//     }

//     // If not authorized, redirect to the login page or send a response
//     res.redirect('/auth/login'); // Change to unauthorized response if needed
// };


module.exports = {
    checkLoginSession,
    checkMktManagerSession,
    checkMktCoordinatorSession,
    checkStudentSession,
    checkGuestSession,
    checkAdminSession,
    checkNotLoggedIn,
    checkStudentOrMktCoordinatorSession,
    checkRoles,
    checkMultipleSession
};
