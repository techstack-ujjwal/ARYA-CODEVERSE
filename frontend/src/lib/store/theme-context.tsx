"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "juryx_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState<boolean>(false);

  const applyThemeToDOM = (resolved: "light" | "dark") => {
    const root = document.documentElement;
    if (resolved === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
      root.style.colorScheme = "light";
    }
    setResolvedTheme(resolved);
  };

  useEffect(() => {
    // 1. Read stored preference or default to system
    let saved: Theme = "system";
    try {
      const item = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (item && (item === "light" || item === "dark" || item === "system")) {
        saved = item;
      }
    } catch {
      // Ignore localStorage access errors (e.g. iframe privacy restrictions)
    }

    setThemeState(saved);

    // 2. Resolve initial active theme
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialResolved: "light" | "dark" =
      saved === "system" ? (prefersDark ? "dark" : "light") : saved;

    applyThemeToDOM(initialResolved);
    setMounted(true);

    // 3. Listen to system dark mode preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (e: MediaQueryListEvent) => {
      try {
        const currentSaved = localStorage.getItem(THEME_STORAGE_KEY);
        if (!currentSaved || currentSaved === "system") {
          applyThemeToDOM(e.matches ? "dark" : "light");
        }
      } catch {
        applyThemeToDOM(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Ignore
    }

    if (newTheme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      applyThemeToDOM(prefersDark ? "dark" : "light");
    } else {
      applyThemeToDOM(newTheme);
    }
  };

  const toggleTheme = () => {
    const next: Theme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  const isDark = mounted ? resolvedTheme === "dark" : false;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme: mounted ? resolvedTheme : "light",
        setTheme,
        toggleTheme,
        isDark,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
