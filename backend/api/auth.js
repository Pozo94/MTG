const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/Judge'); // Model User

// Rejestracja
router.post('/register', async (req, res) => {
    try {

        const { username, email, password,role } = req.body;

        // Walidacja
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Wszystkie pola są wymagane.' });
        }

        // Czy użytkownik już istnieje
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Użytkownik o podanym emailu lub nazwie już istnieje.' });
        }

        // Hashowanie hasła
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Tworzenie użytkownika
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role,
        });

        await newUser.save();

        res.status(201).json({ message: 'Rejestracja zakończona sukcesem.' });
    } catch (err) {
        console.error('Błąd podczas rejestracji:', err);
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});

// Logowanie
router.post('/login', async (req, res) => {
    try {
        console.log('BODY:', req.body);
        const { identifier, password} = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ message: 'Podaj email/nazwę i hasło.' });
        }

        // Szukanie użytkownika po emailu lub username
        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        });

        if (!user) {
            return res.status(400).json({ message: 'Nieprawidłowy email/nazwa lub hasło.' });
        }

        // Sprawdzanie hasła
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Nieprawidłowy email/nazwa lub hasło.' });
        }

        // Generowanie tokenu JWT
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role:user.role
            },
        });
        console.log('Ok. Zalogowano');
    } catch (err) {

        console.error('Błąd podczas logowania:', err); // ← ważne
        res.status(500).json({ message: 'Błąd serwera.' });
    }
});

module.exports = router;
