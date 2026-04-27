export function setCookie(name, value, days = 365) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)};${expires};path=/;SameSite=Lax`;
}

export function getCookie(name) {
  const n = encodeURIComponent(name) + "=";
  const parts = document.cookie.split(";").map(p => p.trim());
  for (const p of parts) {
    if (p.startsWith(n)) return decodeURIComponent(p.substring(n.length));
  }
  return null;
}
