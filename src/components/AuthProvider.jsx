import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react'

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const checkAuth = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/auth/check-login', { withCredentials: true });
            setUser(response.data);
        }
        catch (error) {
            setUser(null);
        }
    };
    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (data) => {
        try {
            await axios.post('http://localhost:5000/api/auth/login', data, { withCredentials: true });
            const response = await axios.get('http://localhost:5000/api/auth/check-login', { withCredentials: true });
            setUser(response.data);
        }
        catch (error) {
            console.log(error);
            const errorMessage = error.response?.data?.errors?.[0]?.msg || error.response?.data?.message ||
                error.message || "Login failed";
            throw new Error(errorMessage);
        }
    }

    const logout = async () => {
        try {
            await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });
            setUser(null);
        }
        catch (error) {
            console.error("Logout failed");
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}
