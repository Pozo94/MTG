const express = require('express');
const Participant = require('../models/participant');
const router = express.Router();

// Endpoint do pobierania wyników
router.get('/', async (req, res) => {
    try {
        // Pobieranie danych z bazy
        const results = await Participant.aggregate([
            {
                $group: {
                    _id: "$group", // Grupowanie po rzucie (group)
                    participants: {
                        $push: {
                            _id: "$_id",
                            name: "$name", // Imię zawodnika
                            team: "$team",  // Zastęp
                            category:"$category",
                            order:"$order",
                            score1: { base: "$score1.base", errors: "$score1.errors",errors2: "$score1.errors2", total: "$score1.total" }, // Ocena z 1 kategorii
                            score2: { base: "$score2.base", errors: "$score2.errors",errors2: "$score2.errors2", total: "$score2.total" }, // Ocena z 2 kategorii
                            score3: { base: "$score3.base", errors: "$score3.errors",errors2: "$score3.errors2", total: "$score3.total" }, // Ocena z 3 kategorii
                            totalScore: {
                                $round: [
                                    {
                                        $add: [
                                            { $ifNull: ["$score1.total", 0] },
                                            { $ifNull: ["$score2.total", 0] },
                                            { $ifNull: ["$score3.total", 0] }
                                        ]
                                    },
                                    2
                                ]
                            }

                        }
                    }
                }
            },
            { $sort: { "_id": 1 }} // Sortowanie po rzucie
        ]);
        // Pobieranie unikalnych grup (rzutów) i drużyn z bazy
        const groups = await Participant.distinct("group");
        const teams = await Participant.distinct("team");
        const category = await Participant.distinct("category");


        res.json({ results, groups, teams,category }); // Zwrócenie odpowiedzi w formacie JSON
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

module.exports = router;
