"use client";

import { AuthContextProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

export function Providers({ children }) {
    return (
        <ThemeProvider>
            <AuthContextProvider>{children}</AuthContextProvider>
        </ThemeProvider>
    );
}
