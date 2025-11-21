const jwt = require('jsonwebtoken');
require('dotenv').config();


function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization || req.session && req.session.token;
    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (req.session && req.session.token) {
        token = req.session.token;
    }


    if (!token) {
        // for web UI redirect to login
        if (req.accepts('html')) return res.redirect('/auth/login');
        return res.status(401).json({ message: 'No token provided' });
    }


    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
}


module.exports = { authenticateJWT };