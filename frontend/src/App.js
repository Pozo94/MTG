import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import EvaluationPage from './pages/EvaluationPage';
import ResultsPage from './pages/ResultsPage';
import Header from './components/Header';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import { ResultsProvider } from './context/ResultsContext';
import { ScoreFeedProvider } from './context/ScoreFeedContext';
import PrivateRoute from "./components/PrivateRoute";

const App = () => {
    return (
        <ResultsProvider>
            <ScoreFeedProvider>
                <Router>
                    <Header />
                    <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route
                            path="/judge"
                            element={
                                <PrivateRoute>
                                    <EvaluationPage />
                                </PrivateRoute>
                            }
                        />
                        <Route path="/results" element={<ResultsPage />} />
                    </Routes>
                </Router>
            </ScoreFeedProvider>
        </ResultsProvider>
    );
};

export default App;
