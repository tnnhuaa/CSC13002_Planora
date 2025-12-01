import { useState, useEffect } from "react";

const COLOR_MAP = {
    Blue: '#2563eb', Purple: '#9333ea', Green: '#16a34a',
    Orange: '#f97316', Pink: '#ec4899',
};

export const useSettings = () => {
    const [settings, setSettings] = useState(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("appSettings");
            return saved ? JSON.parse(saved) : { 
                darkMode: false, 
                accentColor: 'Blue',
                displayName: 'John Doe',
                jobTitle: 'Product Manager'
            };
        }
        return { darkMode: false, accentColor: 'Blue' };
    });

    useEffect(() => {
        const root = window.document.documentElement;

        if (settings.darkMode) {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }

        const colorHex = COLOR_MAP[settings.accentColor] || COLOR_MAP.Blue;
        root.style.setProperty('--primary', colorHex);

        localStorage.setItem("appSettings", JSON.stringify(settings));

    }, [settings]);

    const updateSettings = (newSettings) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    return { settings, updateSettings };
};