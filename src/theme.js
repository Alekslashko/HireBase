import { getCookie, setCookie } from "./utils/cookies";

const THEME_COOKIE = "hirebase_theme";
const CONSENT_COOKIE = "hirebase_cookie_consent";

export function getSavedTheme() {
  const t = getCookie(THEME_COOKIE);
  return t === "dark" || t === "light" ? t : null;
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

export function setTheme(theme) {
  applyTheme(theme);
  const consent = getCookie(CONSENT_COOKIE);
  if (consent === "yes") setCookie(THEME_COOKIE, theme, 365);
}

export function getConsent() {
  return getCookie(CONSENT_COOKIE);
}

export function grantConsent() {
  setCookie(CONSENT_COOKIE, "yes", 365);
}

export function denyConsent() {
  setCookie(CONSENT_COOKIE, "no", 365);
}
