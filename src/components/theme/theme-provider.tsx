"use client";

import { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "light" | "dark" | "auto";

interface ThemeContextType {
  themeMode: ThemeMode;
  accentColor: string;
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("dark");
  const [accentColor, setAccentColorState] = useState("#1db954");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadTheme();
  }, []);

  const loadTheme = async () => {
    const localTheme = localStorage.getItem("theme-mode") as ThemeMode;
    const localAccent = localStorage.getItem("accent-color");

    if (localTheme) {
      setThemeModeState(localTheme);
      applyTheme(localTheme);
    }

    if (localAccent) {
      setAccentColorState(localAccent);
      applyAccentColor(localAccent);
    }

    try {
      const response = await fetch("/api/theme");
      const data = await response.json();
      if (data.theme) {
        const mode = data.theme.theme_mode as ThemeMode;
        const color = data.theme.accent_color;
        
        setThemeModeState(mode);
        setAccentColorState(color);
        applyTheme(mode);
        applyAccentColor(color);
        
        localStorage.setItem("theme-mode", mode);
        localStorage.setItem("accent-color", color);
      }
    } catch (error) {
      console.error("Failed to load theme:", error);
    }
  };

  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement;
    
    if (mode === "auto") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
    } else {
      root.classList.toggle("dark", mode === "dark");
    }
  };

  const applyAccentColor = (color: string) => {
    document.documentElement.style.setProperty("--accent-color", color);
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    applyTheme(mode);
    localStorage.setItem("theme-mode", mode);

    try {
      await fetch("/api/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme_mode: mode }),
      });
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  };

  const setAccentColor = async (color: string) => {
    setAccentColorState(color);
    applyAccentColor(color);
    localStorage.setItem("accent-color", color);

    try {
      await fetch("/api/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accent_color: color }),
      });
    } catch (error) {
      console.error("Failed to save accent color:", error);
    }
  };

  useEffect(() => {
    if (themeMode === "auto") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("auto");
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [themeMode]);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        accentColor,
        setThemeMode,
        setAccentColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
