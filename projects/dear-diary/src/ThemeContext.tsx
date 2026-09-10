import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ThemeName, FontChoice } from '../types';
import { db } from '../db/db';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  font: FontChoice;
  setFont: (font: FontChoice) => void;
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeName>('sunset');
  const [font, setFontState] = useState<FontChoice>('serif');
  const [fontSize, setFontSizeState] = useState<'small' | 'medium' | 'large'>('medium');

  useEffect(() => {
    // Load persisted settings from IndexedDB
    const loadSettings = async () => {
      const userSettings = await db.settings.toCollection().first();
      if (userSettings) {
        if (userSettings.theme) setThemeState(userSettings.theme);
        if (userSettings.fontChoice) setFontState(userSettings.fontChoice);
        if (userSettings.fontSize) setFontSizeState(userSettings.fontSize);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    // Apply dataset attributes to root document
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-font', font);
    document.documentElement.setAttribute('data-font-size', fontSize);
  }, [theme, font, fontSize]);

  const setTheme = async (newTheme: ThemeName) => {
    setThemeState(newTheme);
    const userSettings = await db.settings.toCollection().first();
    if (userSettings && userSettings.id) {
      await db.settings.update(userSettings.id, { theme: newTheme });
    }
  };

  const setFont = async (newFont: FontChoice) => {
    setFontState(newFont);
    const userSettings = await db.settings.toCollection().first();
    if (userSettings && userSettings.id) {
      await db.settings.update(userSettings.id, { fontChoice: newFont });
    }
  };

  const setFontSize = async (newSize: 'small' | 'medium' | 'large') => {
    setFontSizeState(newSize);
    const userSettings = await db.settings.toCollection().first();
    if (userSettings && userSettings.id) {
      await db.settings.update(userSettings.id, { fontSize: newSize });
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, font, setFont, fontSize, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
