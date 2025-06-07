import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const ScoreFeedContext = createContext();

export const useScoreFeed = () => useContext(ScoreFeedContext);

const socket = io(process.env.REACT_APP_API_URL); // dostosuj URL jeśli inny
const scoreToApp = {
    FX:"Ćw. Wolne",
    VT:"Skok",
    AD:"Dodatkowy przyrząd",
    SR:"Kółka",
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
        socket.on('latestScores', (scores) => {
            setLatestScores(scores); // ← tutaj ustawiamy od razu cały stan
        });
        socket.on('evaluationEnded', (participantId) => {
            setActiveEvaluations((prev) => prev.filter(p => p._id !== participantId));
        });
        socket.on('activeEvaluations', (currentList) => {
            setActiveEvaluations(currentList);
        });


        return () => {
            socket.off('activeEvaluations');
            socket.off('scoreAdded');
            socket.off('latestScores');
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
