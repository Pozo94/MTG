const jwt = require('jsonwebtoken');

const redirectIfAuthenticatedJWT = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader?.split(' ')[1]; // Bearer <token>

    if (!token) {
        return next(); // Brak tokenu – OK, może wejść
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        // Jeśli token jest poprawny, użytkownik już jest zalogowany
        return res.status(403).json({ message: 'Jesteś już zalogowany.' });
    } catch (err) {
        // Token niepoprawny – traktujemy jak niezalogowanego
        next();
    }
};

module.exports = redirectIfAuthenticatedJWT;
