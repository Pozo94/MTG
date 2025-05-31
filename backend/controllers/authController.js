// authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Judge = require('../models/judge'); // Zakładamy, że masz model judge

// Rejestracja
exports.register = async (req, res) => {
    const { email, password } = req.body;

    // Sprawdzenie, czy użytkownik już istnieje
    const judgeExists = await judge.findOne({ email });
    if (judgeExists) {
        return res.status(400).json({ message: 'judge already exists' });
    }

    // Haszowanie hasła
    const hashedPassword = await bcrypt.hash(password, 10);

    const newjudge = new judge({ email, password: hashedPassword });
    await newjudge.save();

    res.status(201).json({ message: 'judge created' });
};

// Logowanie
exports.login = async (req, res) => {
    const { email, password } = req.body;

    // Sprawdzenie, czy użytkownik istnieje
    const judge = await judge.findOne({ email });
    if (!judge) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Sprawdzenie hasła
    const isMatch = await bcrypt.compare(password, judge.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Tworzenie tokenu JWT
    const token = jwt.sign({ judgeId: judge._id }, 'your_jwt_secret', { expiresIn: '1h' });

    res.status(200).json({ token });
};
