// components\app\providers\ThemeProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface ThemeContextType {
    isDark: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check for saved preference or system preference
        const saved = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = saved ? saved === 'dark' : prefersDark;

        setIsDark(shouldBeDark);
        applyTheme(shouldBeDark);
    }, []);

    const applyTheme = (dark: boolean) => {
        if (dark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    };

    const toggleTheme = () => {
        const newState = !isDark;
        setIsDark(newState);
        applyTheme(newState);
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}