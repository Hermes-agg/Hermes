// components/DarkModeToggle.tsx
"use client";

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { MoonStar, Sun } from 'lucide-react'

export function ThemeModeToggle() {
    const { resolvedTheme, setTheme } = useTheme();

    const isDark = resolvedTheme === 'dark';

    const handleToggle = () => {
        try {
            setTheme(isDark ? 'light' : 'dark');
        } catch (e) {
            // ignore SSR issues
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            console.debug('[ThemeModeToggle] resolvedTheme changed=', resolvedTheme);
        }
    }, [resolvedTheme]);

    return (
        <button
            onClick={handleToggle}
            role="switch"
            aria-checked={isDark}
            aria-label="Toggle dark mode"
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
            <div className="flex relative items-center justify-center gap-2 w-16 h-8 transition-colors duration-300 overflow-hidden">

                {/* Sharp corner accents */}
                <div className="absolute top-0 left-0 w-1 h-1 border-t-2 border-l-2 border-primary" />
                <div className="absolute top-0 right-0 w-1 h-1 border-t-2 border-r-2 border-primary" />
                <div className="absolute bottom-0 left-0 w-1 h-1 border-b-2 border-l-2 border-primary" />
                <div className="absolute bottom-0 right-0 w-1 h-1 border-b-2 border-r-2 border-primary" />

                {/* Thick Filled Moon */}
                <MoonStar
                    size={24}
                    strokeWidth={0}
                    fill="currentColor"
                    className={`text-foreground transition-all duration-300 flex-shrink-0 ${isDark ? 'opacity-100 translate-x-4' : 'opacity-0 -translate-x-4'
                        }`}
                />

                {/* Thick Filled Sun */}
                <Sun
                    size={54}
                    strokeWidth={0}
                    fill="currentColor"
                    className={`text-primary transition-all duration-300 flex-shrink-0 ${!isDark ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                        }`}
                />
            </div>
        </button>
    );
}