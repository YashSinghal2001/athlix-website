/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

const STORAGE_KEY = "athlix-theme-preference"; // "light" | "dark" | "auto"

/**
 * Resolve the effective theme for AUTO mode.
 * Priority: system color-scheme preference, then fall back to local time of day.
 * Day (06:00–18:59) => light, Night => dark.
 */
function resolveAutoTheme() {
  if (typeof window === "undefined") return "light";

  const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
  if (mql && typeof mql.matches === "boolean") {
    if (mql.matches) return "dark";
    const hour = new Date().getHours();
    return hour >= 6 && hour < 19 ? "light" : "dark";
  }

  const hour = new Date().getHours();
  return hour >= 6 && hour < 19 ? "light" : "dark";
}

function readStoredPreference() {
  if (typeof window === "undefined") return "auto";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "auto") return stored;
  } catch {
    /* ignore storage access errors */
  }
  return "auto";
}

export function ThemeProvider({ children }) {
  // What the user chose: "auto" | "light" | "dark"
  const [preference, setPreference] = useState(readStoredPreference);
  // The auto-resolved theme, kept in sync with system + time-of-day.
  const [autoTheme, setAutoTheme] = useState(resolveAutoTheme);

  // The actually-applied theme is derived during render (no setState-in-effect).
  const resolvedTheme = preference === "auto" ? autoTheme : preference;

  // Keep AUTO theme reactive to system changes + periodic time-of-day checks.
  useEffect(() => {
    const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
    const update = () => setAutoTheme(resolveAutoTheme());

    update();
    mql?.addEventListener?.("change", update);
    // Re-evaluate time of day every 10 minutes so day/night flips automatically.
    const interval = window.setInterval(update, 10 * 60 * 1000);

    return () => {
      mql?.removeEventListener?.("change", update);
      window.clearInterval(interval);
    };
  }, []);

  // Apply theme to <html> and the address-bar color.
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", resolvedTheme);
    root.style.colorScheme = resolvedTheme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", resolvedTheme === "dark" ? "#08090c" : "#ffffff");
  }, [resolvedTheme]);

  // Persist the user's preference.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      /* ignore */
    }
  }, [preference]);

  // Manual selection always overrides auto detection.
  const setTheme = useCallback((value) => setPreference(value), []);

  const toggleTheme = useCallback(() => {
    setPreference((prev) => {
      const current = prev === "auto" ? resolveAutoTheme() : prev;
      return current === "dark" ? "light" : "dark";
    });
  }, []);

  const value = useMemo(
    () => ({ preference, resolvedTheme, setTheme, toggleTheme }),
    [preference, resolvedTheme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
