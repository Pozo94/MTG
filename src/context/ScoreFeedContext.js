import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const ScoreFeedContext = createContext();

export const useScoreFeed = () => useContext(ScoreFeedContext);

const socket = io('http://localhost:5000'); // dostosuj URL jeśli inny
const scoreToApp = {
    FX:"Ćw. Wolne",
    VT:"Skok",
    AD:"Dodatkowy przyrząd",
};
export const ScoreFeedProvider = ({ children }) => {
    const [latestScores, setLatestScores] = useState([]); // ostatnie 12
    const [activeEvaluations, setActiveEvaluations] = useState([]); // aktualnie oceniani

    // Odbieranie nowych ocen z serwera (broadcast)
    useEffect(() => {
        socket.on('scoreAdded', (scoreObj) => {
            addScore(scoreObj);
        });

        socket.on('evaluationStarted', (participant) => {
            setActiveEvaluations((prev) => [...prev, participant]);

        });

        socket.on('evaluationEnded', (participantId) => {
            setActiveEvaluations((prev) => prev.filter(p => p._id !== participantId));
        });

        return () => {
            socket.off('scoreAdded');
            socket.off('evaluationStarted');
            socket.off('evaluationEnded');
        };
    }, []);

    const addScore = (scoreObj) => {
        setLatestScores((prev) => {
            const updated = [scoreObj, ...prev];
            return updated.slice(0, 12);
        });
    };

    const startEvaluation = (participant,role) => {
        const minimalParticipant = {
            _id: participant._id,
            name: participant.name,
            category: participant.category,
            team: participant.team,
            app:scoreToApp[role]
        };
        socket.emit('evaluationStarted', minimalParticipant);
        setActiveEvaluations((prev) => [...prev, participant]);
    };

    const endEvaluation = (participantId) => {
        socket.emit('evaluationEnded', participantId);
        setActiveEvaluations((prev) => prev.filter(p => p._id !== participantId));
    };

    const pushScore = (scoreObj) => {
        socket.emit('scoreAdded', scoreObj);
        addScore(scoreObj);
    };

    return (
        <ScoreFeedContext.Provider value={{
            latestScores,
            activeEvaluations,
            addScore,
            pushScore,
            startEvaluation,
            endEvaluation,
        }}>
            {children}
        </ScoreFeedContext.Provider>
    );
};
