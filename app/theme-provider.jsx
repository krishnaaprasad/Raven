'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const ThemeContext = createContext(null);

const PALETTES = {
  dark: {
    "--theme-bg": "#0f0f0f",
    "--theme-soft": "#161616",
    "--theme-border": "#262626",
    "--theme-text": "#f5f5f5",
    "--theme-muted": "#9a9a9a",
    "--background": "#0f0f0f",
    "--foreground": "#f5f5f5",
  },
  light: {
    "--theme-bg": "#ffffff",
    "--theme-soft": "#f6f6f6",
    "--theme-border": "#e8e8e8",
    "--theme-text": "#111111",
    "--theme-muted": "#666666",
    "--background": "#ffffff",
    "--foreground": "#171717",
  },
  // Admin panel is designed light-only
  admin: {
    "--theme-bg": "#fcfbf8",
    "--theme-soft": "#f6f6f6",
    "--theme-border": "#e7e1cf",
    "--theme-text": "#1b180d",
    "--theme-muted": "#6b6654",
    "--background": "#ffffff",
    "--foreground": "#171717",
  },
};

function applyPalette(name) {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", name === "dark");
  // Native form controls / scrollbars follow too
  root.style.colorScheme = name === "dark" ? "dark" : "light";
  for (const [k, v] of Object.entries(PALETTES[name])) root.style.setProperty(k, v);
}

export function ThemeProvider({ children }) {
  // ✅ Default to "light" immediately to avoid the "if (!theme) return null" block
  // This allows the server-rendered HTML to match the client during hydration
  const [theme, setTheme] = useState("light");
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    setTheme(saved === "dark" ? "dark" : "light");
  }, []);

  // Single place that applies the theme. The admin panel is always light, whatever the
  // storefront choice is (dark mode turned admin headings/text white-on-white), and the
  // saved choice comes back when you leave the admin.
  useEffect(() => {
    applyPalette(isAdmin ? "admin" : theme);
  }, [theme, isAdmin]);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
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
