import { TOTAL_LEVELS, starsFor } from "../engine/campaign.js";
const KEY = "jaque:progress:v1";
const DEFAULT = () => ({
  unlockedLevel: 1,
  stars: {},
  lastPlayed: 1,
  updatedAt: Date.now()
});
function safeParse(raw) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
export function loadLocal() {
  if (typeof localStorage === "undefined") return DEFAULT();
  return safeParse(localStorage.getItem(KEY)) || DEFAULT();
}
export function saveLocal(progress) {
  if (typeof localStorage === "undefined") return;
  progress.updatedAt = Date.now();
  localStorage.setItem(KEY, JSON.stringify(progress));
}
export function mergeProgress(a, b) {
  if (!a) return b;
  if (!b) return a;
  const stars = {
    ...a.stars
  };
  for (const k of Object.keys(b.stars || {})) {
    stars[k] = Math.max(stars[k] || 0, b.stars[k] || 0);
  }
  return {
    unlockedLevel: Math.max(a.unlockedLevel || 1, b.unlockedLevel || 1),
    stars,
    lastPlayed: (a.updatedAt || 0) >= (b.updatedAt || 0) ? a.lastPlayed : b.lastPlayed,
    updatedAt: Math.max(a.updatedAt || 0, b.updatedAt || 0)
  };
}
export function recordResult(progress, level, kind, result) {
  const p = {
    ...progress,
    stars: {
      ...progress.stars
    }
  };
  const gained = starsFor(kind, result);
  const prev = p.stars[level] || 0;
  if (gained > prev) p.stars[level] = gained;
  if (gained > 0 && level >= p.unlockedLevel && level < TOTAL_LEVELS) {
    p.unlockedLevel = level + 1;
  }
  p.lastPlayed = level;
  return p;
}
export function totalStars(progress) {
  return Object.values(progress.stars || {}).reduce((s, v) => s + v, 0);
}
export function isUnlocked(progress, level) {
  return level <= (progress.unlockedLevel || 1);
}
