const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./api/auth');
const participantRoutes = require('./api/participants');
const resultsRoutes = require('./api/results');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app); // <-- używamy do socket.io
let latestScores = [];
let activeEvaluations = [];
const App_MAP = {
    score1: "Ćw. Wolne",
    score2: "Skok",
    score3:"Dodatkowy przyrząd",

};
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Trasy
app.use('/api/auth', authRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/results', resultsRoutes);

// Socket.IO
io.on('connection', (socket) => {

    socket.on('evaluationStarted', ( participant ) => {
        activeEvaluations.push(participant);
        socket.activeEvaluation=participant._id;
        console.log(socket.activeEvaluation)
        socket.broadcast.emit('evaluationStarted', { ...participant});

    });
    socket.on('evaluationEnded', (id) => {
        activeEvaluations = activeEvaluations.filter(p => p._id !== id);
        socket.broadcast.emit('evaluationEnded', id);

    });
    socket.on('scoreAdded', (scoreObj) => {
        console.log(scoreObj.scoreKey)
        scoreObj.scoreKey=App_MAP[scoreObj.scoreKey]

        latestScores.unshift(scoreObj);
        latestScores = latestScores.slice(0, 12);
        io.emit('scoreAdded', scoreObj);
    });
    // Wyślij aktualny stan po połączeniu
    socket.emit('activeEvaluations', activeEvaluations);
    socket.emit('latestScores', latestScores);
    socket.on('disconnect', () => {
        console.log(socket.activeEvaluation)
        if (socket.activeEvaluation) {
            socket.broadcast.emit('evaluationEnded', socket.activeEvaluation);
            console.log("a czy to się dzieje");
        }
    });
});

// Przekazujemy instancję io do aplikacji — można użyć w routerach np. przez req.app.get('io')
app.set('io', io);

// Połączenie z MongoDB i uruchomienie serwera
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("✅ Połączono z MongoDB");

    // Start serwera dopiero po połączeniu z bazą
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`🚀 Serwer działa na http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error("❌ Błąd połączenia z MongoDB:", err);
});
