import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState(null);
    const [balance, setBalance] = useState(0);

    // 초기값 sessionStorage 기반
    useEffect(() => {
        const storedLoginId = sessionStorage.getItem('loginId');
        const storedUserName = sessionStorage.getItem('userName');
        const storedUserId = sessionStorage.getItem('userId');
        const storedBalance = sessionStorage.getItem('balance');
        if (storedLoginId) {
            setIsLoggedIn(true);
            setUserName(storedUserName || '');
            setUserId(storedUserId || null);
            setBalance(storedBalance || 0);
        }
    }, []);

    const login = (data) => {
        sessionStorage.setItem('loginId', data.loginId);
        sessionStorage.setItem('userId', data.userid);
        sessionStorage.setItem('userName', data.realName);
        sessionStorage.setItem('balance', data.balance);

        setIsLoggedIn(true);
        setUserName(data.realName);
        setUserId(data.userid);
        setBalance(data.balance);

        console.log(data);
    };

    const logout = () => {
        sessionStorage.clear();
        setIsLoggedIn(false);
        setUserName('');
        setUserId(null);
        setBalance(0);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, userName, userId, balance, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
