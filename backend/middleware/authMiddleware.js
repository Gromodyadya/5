const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(403).json({ message: 'Токен не предоставлен.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Токен недействителен.' });
        }
        req.userId = decoded.id; // Добавляем ID пользователя в запрос
        next();
    });
};

module.exports = verifyToken;