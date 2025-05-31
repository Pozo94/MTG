// PrivateRoute.js
import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const user = JSON.parse(localStorage.getItem('user'));

    return user ? children : <Navigate to="/login" replace />;
};


export default PrivateRoute;
