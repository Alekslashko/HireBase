import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { applyTheme, denyConsent, getConsent, getSavedTheme, grantConsent, setTheme as persistTheme } from "../theme";

const UICtx = createContext(null);

export function UIProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const [cookieConsent, setCookieConsent] = useState(null);

  useEffect(() => {
    const consent = getConsent();
    setCookieConsent(consent);
    const saved = getSavedTheme();
    const initial = saved || (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    setTheme(initial);
    applyTheme(initial);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    persistTheme(next);
  }

  function acceptCookies() {
    grantConsent();
    setCookieConsent("yes");
    persistTheme(theme);
  }
  function rejectCookies() {
    denyConsent();
    setCookieConsent("no");
  }

  const value = useMemo(() => ({
    theme, toggleTheme,
    cookieConsent, acceptCookies, rejectCookies
  }), [theme, cookieConsent]);

  return <UICtx.Provider value={value}>{children}</UICtx.Provider>;
}

export function useUI() { return useContext(UICtx); }
