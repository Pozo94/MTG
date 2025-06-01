// ResultsContext.js
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const ResultsContext = createContext();

export const ResultsProvider = ({ children }) => {
    const [results, setResults] = useState([]);
    const [groups, setGroups] = useState([]);
    const [categories, setCategories] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(Date.now());

    const fetchResults = useCallback(async () => {
        try {
            const response = await axios.get(process.env.REACT_APP_API_URL+'/api/results');
            const data = response.data;
            setResults(data.results);
            setGroups(data.groups);
            setCategories(data.category);
        } catch (error) {
            console.error('Błąd podczas pobierania wyników:', error);
        }
    }, []);

    const refreshResults = () => {
        setLastUpdated(Date.now());
    };

    // Fetch results once on mount
    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    // Fetch again when lastUpdated changes (manual trigger)
    useEffect(() => {
        fetchResults();

    }, [lastUpdated]);

    return (
        <ResultsContext.Provider value={{ results, groups, categories, fetchResults, lastUpdated, refreshResults }}>
            {children}
        </ResultsContext.Provider>
    );
};

export const useResults = () => useContext(ResultsContext);
