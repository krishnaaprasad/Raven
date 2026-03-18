'use client';

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // ✅ Default to "light" immediately to avoid the "if (!theme) return null" block
  // This allows the server-rendered HTML to match the client during hydration
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    // const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const finalTheme = saved || "light";

    setTheme(finalTheme);
    applyTheme(finalTheme);
  }, []);

  function applyTheme(mode) {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;

    root.classList.toggle("dark", mode === "dark");

    if (mode === "dark") {
      root.style.setProperty("--theme-bg", "#0f0f0f");
      root.style.setProperty("--theme-soft", "#161616");
      root.style.setProperty("--theme-border", "#262626");
      root.style.setProperty("--theme-text", "#f5f5f5");
      root.style.setProperty("--theme-muted", "#9a9a9a");
    } else {
      root.style.setProperty("--theme-bg", "#ffffff");
      root.style.setProperty("--theme-soft", "#f6f6f6");
      root.style.setProperty("--theme-border", "#e8e8e8");
      root.style.setProperty("--theme-text", "#111111");
      root.style.setProperty("--theme-muted", "#666666");
    }
  }

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) return { theme: 'light', toggleTheme: () => {} };
  return context;
}
