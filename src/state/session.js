const KEY = "jaque:session:v1";
const MAX_AGE = 1000 * 60 * 60 * 24 * 14;
const RESUMIBLES = ["campaign", "puzzle", "machine", "training"];

function vacio() {
  return { screen: "menu", playCfg: null, game: null, updatedAt: 0 };
}

export function loadSession() {
  if (typeof localStorage === "undefined") return vacio();
  let s;
  try {
    s = JSON.parse(localStorage.getItem(KEY));
  } catch {
    return vacio();
  }
  if (!s || typeof s !== "object") return vacio();
  if (!s.updatedAt || Date.now() - s.updatedAt > MAX_AGE) {
    clearSession();
    return vacio();
  }
  if (s.screen === "online") return vacio();
  if (s.screen === "play" && !(s.playCfg && RESUMIBLES.includes(s.playCfg.mode))) return vacio();
  return s;
}

export function saveSession(patch) {
  if (typeof localStorage === "undefined") return;
  const actual = loadSession();
  const s = { ...actual, ...patch, updatedAt: Date.now() };
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

export function clearSession() {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

export function hayPartidaGuardada(s) {
  return !!(s && s.game && s.playCfg && RESUMIBLES.includes(s.playCfg.mode) && !s.game.finished);
}

export function etiquetaPartida(s) {
  if (!hayPartidaGuardada(s)) return null;
  const { mode, levelInfo, level } = s.playCfg;
  if (mode === "campaign" || mode === "puzzle") return `Nivel ${level}${levelInfo?.title ? " · " + levelInfo.title : ""}`;
  if (mode === "training") return "Entrenamiento";
  return "Partida vs máquina";
}
