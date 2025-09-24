// components/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: {
    background: string;
    cardBackground: string;
    textColor: string;
    secondaryText: string;
    borderColor: string;
    inputBackground: string;
    inputFocusBackground: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = {
    background: isDarkMode ? "#000000" : "#ffffff",
    cardBackground: isDarkMode ? "#202020" : "#ffffff",
    textColor: isDarkMode ? "#ffffff" : "#1a1a1a",
    secondaryText: isDarkMode ? "#cccccc" : "#8e8e93",
    borderColor: isDarkMode ? "#404040" : "#f0f0f0",
    inputBackground: isDarkMode ? "#303030" : "#fafafa",
    inputFocusBackground: isDarkMode ? "#404040" : "#ffffff",
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
