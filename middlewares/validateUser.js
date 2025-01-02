const prisma = require('../config/prismaClient');

const validateUser = (req, res, next) => {
    if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: 'Unauthorized: Please log in' });
    }

    req.userID = req.user.userID; // Pass the userID for convenience
    next();
};

module.exports = validateUser;
