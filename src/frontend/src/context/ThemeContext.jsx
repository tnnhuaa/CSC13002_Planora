import React, { createContext, useContext, useState, useEffect } from "react";
import { useSettings } from "../hooks/UseSetting";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const { settings, updateSettings } = useSettings();

    return (
        <ThemeContext.Provider value={{ settings, updateSettings }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);