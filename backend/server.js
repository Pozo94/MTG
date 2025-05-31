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
        socket.broadcast.emit('evaluationStarted', { ...participant});

    });
    socket.on('evaluationEnded', (id) => {
        socket.broadcast.emit('evaluationEnded', id);

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
