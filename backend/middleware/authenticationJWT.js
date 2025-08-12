/**
 * JWT Authentication Middleware
 * Verifies that a valid JWT is provided to the user in authHeader.
 * On success: Attaches the decoded user object to req.auth and calls next().
 * On failure: Returns 401 Unauthorized to the user.
 */

const jwt = require('jsonwebtoken');

function authenticateJWT(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.sendStatus(401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        console.log('Not enough tokens in Auth Header: ' + headers.length);
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, verified) => {
        if (err) {
            return res.status(401).json('Token Validation Error!');
        }
        req.auth = verified;
        next();
    });
}

module.exports = authenticateJWT;
