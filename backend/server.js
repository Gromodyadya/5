const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

// Временное хранилище пользователей (в памяти)
const users = [];

// Функция для генерации JWT токена
function generateToken(user) {
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Токен истекает через 1 час
}

// Маршрут регистрации
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Необходимо указать имя пользователя и пароль.' });
    }

    const userExists = users.find(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: 'Пользователь с таким именем уже существует.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        id: users.length + 1,
        username,
        password: hashedPassword
    };
    users.push(newUser);

    res.status(201).json({ message: 'Пользователь успешно зарегистрирован.' });
});

// Маршрут входа
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Необходимо указать имя пользователя и пароль.' });
    }

    const user = users.find(user => user.username === username);
    if (!user) {
        return res.status(401).json({ message: 'Неверные учетные данные.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return res.status(401).json({ message: 'Неверные учетные данные.' });
    }

    const token = generateToken(user);
    res.json({ token });
});

// Middleware для проверки JWT (backend/middleware/authMiddleware.js)
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

// Защищенный маршрут
app.get('/protected', verifyToken, (req, res) => {
    res.json({ message: 'Доступ к защищенным данным разрешен!', userId: req.userId });
});

app.listen(port, () => {
    console.log(`Бэкенд запущен на порту ${port}`);
});