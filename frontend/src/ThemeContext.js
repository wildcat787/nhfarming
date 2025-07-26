import React, { createContext, useContext, useState, useEffect } from 'react';
import createAppTheme from './theme';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Get initial theme from localStorage or default to 'dark'
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('theme-mode');
    return savedMode || 'dark';
  });

  // Create theme based on current mode
  const theme = createAppTheme(mode);

  // Toggle between dark and light mode
  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('theme-mode', newMode);
  };

  // Set specific theme mode
  const setThemeMode = (newMode) => {
    if (newMode === 'light' || newMode === 'dark') {
      setMode(newMode);
      localStorage.setItem('theme-mode', newMode);
    }
  };

  // Update document body class for CSS custom properties
  useEffect(() => {
    document.body.className = `theme-${mode}`;
  }, [mode]);

  const value = {
    mode,
    theme,
    toggleTheme,
    setThemeMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 