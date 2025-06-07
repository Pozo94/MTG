const express = require('express');
const Participant = require('../models/participant');
const router = express.Router();



router.put('/:_id', async (req, res) => {
    const { scoreKey, score } = req.body;
    const id = req.params._id;

    try {
        // Budujemy pole dynamicznie, np. score1.total
        const scoreField = `${scoreKey}`;

        // Tworzymy obiekt update
        const update = {
            [`${scoreKey}`]: score,
        };


        const participant = await Participant.findById(id);

        if (!participant) return res.status(404).json({ error: 'Zawodnik nie znaleziony.' });

        // Nadpisujemy tylko jedną kategorię
        participant[scoreKey] = score;

        // Obliczamy totalScore (sumę wszystkich totali z kategorii, jeśli istnieją)
        const t1 = participant.score1?.total ?? 0;
        const t2 = participant.score2?.total ?? 0;
        const t3 = participant.score3?.total ?? 0;
        const t4 = participant.score4?.total ?? 0;

        participant.totalScore = Number((t1 + t2 + t3 + t4).toFixed(2));

        await participant.save();
        //const io = req.app.get('io');
        // if (io) {
        //     io.emit('scoresUpdated');
        //
        // }

        res.status(200).json({ message: 'Zawodnik zaktualizowany pomyślnie.' });
    } catch (err) {
        console.error('Błąd przy aktualizacji:', err);
        res.status(500).json({ error: 'Błąd serwera podczas aktualizacji zawodnika.' });
    }
});

module.exports = router;
