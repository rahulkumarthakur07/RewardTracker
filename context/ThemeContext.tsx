import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { themes, CalendarTheme } from "@/constants/theme";

type ThemeContextType = {
  dark: boolean;
  toggleDark: () => void;
  currentTheme: CalendarTheme;
  setTheme: (themeName: string) => void;
};

const THEME_KEY = "APP_THEME";
const CALENDAR_THEME_KEY = "CALENDAR_THEME";

export const ThemeContext = createContext<ThemeContextType>({
  dark: false,
  toggleDark: () => {},
  currentTheme: themes[0],
  setTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [dark, setDark] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<CalendarTheme>(themes[0]);

  // Load theme from storage
  useEffect(() => {
    (async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_KEY);
        const savedCalendarTheme = await AsyncStorage.getItem(CALENDAR_THEME_KEY);

        if (savedTheme !== null) setDark(savedTheme === "dark");
        if (savedCalendarTheme) {
          const theme = themes.find(t => t.name === savedCalendarTheme);
          if (theme) setCurrentTheme(theme);
        }
      } catch (e) {
        console.log("Failed to load theme:", e);
      }
    })();
  }, []);

  const toggleDark = async () => {
    try {
      const newValue = !dark;
      setDark(newValue);
      await AsyncStorage.setItem(THEME_KEY, newValue ? "dark" : "light");
    } catch (e) {
      console.log("Failed to save theme:", e);
    }
  };

  const setTheme = async (themeName: string) => {
    const theme = themes.find(t => t.name === themeName);
    if (!theme) return;
    setCurrentTheme(theme);
    await AsyncStorage.setItem(CALENDAR_THEME_KEY, themeName);
  };

  return (
    <ThemeContext.Provider value={{ dark, toggleDark, currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
