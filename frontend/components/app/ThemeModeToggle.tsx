// components/DarkModeToggle.tsx
"use client";

import { useEffect } from 'react'
import { Moon, Sun } from "lucide-react";
import { useTheme } from 'next-themes';

export function ThemeModeToggle() {
    const { resolvedTheme, setTheme } = useTheme();

    const isDark = resolvedTheme === 'dark';

    const handleToggle = () => {
        // Toggle using next-themes setTheme
        try {
            console.debug('[ThemeModeToggle] before toggle resolvedTheme=', resolvedTheme, 'html.classList=', typeof window !== 'undefined' ? Array.from(document.documentElement.classList).join(' ') : 'ssr');
            setTheme(isDark ? 'light' : 'dark');
            console.debug('[ThemeModeToggle] after setTheme called');
        } catch (e) {
            // ignore in case setTheme not available during SSR
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            console.debug('[ThemeModeToggle] resolvedTheme changed=', resolvedTheme, 'html.classList=', Array.from(document.documentElement.classList).join(' '));
        }
    }, [resolvedTheme]);

    return (
        <button
            onClick={handleToggle}
            role="switch"
            aria-checked={isDark}
            aria-label="Toggle dark mode"
            className="relative inline-flex items-center justify-center w-14 h-8 sm:w-18 sm:h-10 bg-secondary border border-border transition-all duration-200 hover:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
            <span className="sr-only">Toggle dark mode</span>

            {/* Track - subtle background */}
            <span
                className={`absolute inset-0 transition-colors duration-200 ${isDark ? 'bg-primary/80' : 'bg-secondary'}`}
            />

            {/* Knob */}
            <span
                className={`absolute left-1 top-1/2 -translate-y-1/2 z-10 h-6 w-6 sm:h-8 sm:w-8 bg-background shadow-md transition-transform duration-300 ${isDark ? 'translate-x-6 sm:translate-x-8' : 'translate-x-0'}`}
            />

            {/* Icons */}
            <Sun
                size={14}
                className={`absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 transition-opacity duration-200 ${isDark ? 'opacity-40' : 'opacity-100 text-primary-foreground'}`}
            />
            <Moon
                size={14}
                className={`absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 transition-opacity duration-200 ${isDark ? 'opacity-100 text-primary-foreground' : 'opacity-40'}`}
            />
        </button>
    );
}

