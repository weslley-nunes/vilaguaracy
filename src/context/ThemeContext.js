"use client";
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState("light"); // Default to light

    useEffect(() => {
        // Check local storage or system preference
        let savedTheme = null;
        try {
            savedTheme = localStorage.getItem("theme");
        } catch (e) {
            console.warn("localStorage access denied in ThemeContext:", e);
        }
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.classList.toggle("dark", savedTheme === "dark");
        } else {
            // Default to light for this specific app style if no preference
            setTheme("light");
            document.documentElement.classList.remove("dark");
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        try {
            localStorage.setItem("theme", newTheme);
        } catch (e) {
            console.warn("localStorage write denied in ThemeContext:", e);
        }
        document.documentElement.classList.toggle("dark", newTheme === "dark");
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
