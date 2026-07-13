import { useEffect } from "react";
export const IDIOMAS = {
  es: "Español",
  en: "English",
  ca: "Català",
  gl: "Galego",
  eu: "Euskara",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  pt: "Português",
  nl: "Nederlands",
  ru: "Русский",
  zh: "中文",
  ja: "日本語",
  ar: "العربية",
  tr: "Türkçe",
  pl: "Polski"
};
const STORE_LANG = "jaque:lang";
export function idiomaDispositivo() {
  if (typeof navigator === "undefined") return "es";
  const cands = [navigator.language, ...(navigator.languages || [])].filter(Boolean);
  for (const l of cands) {
    const c = l.slice(0, 2).toLowerCase();
    if (IDIOMAS[c]) return c;
  }
  return "es";
}
export function idiomaInicial() {
  try {
    const s = localStorage.getItem(STORE_LANG);
    if (s) return s;
  } catch {}
  return idiomaDispositivo();
}
export function guardarIdioma(l) {
  try {
    localStorage.setItem(STORE_LANG, l);
  } catch {}
}
function claveCache(lang) {
  return "jaque:tr:" + lang;
}
function cargarCache(lang) {
  try {
    return JSON.parse(localStorage.getItem(claveCache(lang)) || "{}");
  } catch {
    return {};
  }
}
function guardarCache(lang, c) {
  try {
    localStorage.setItem(claveCache(lang), JSON.stringify(c));
  } catch {}
}
const TIENE_LETRA = /[A-Za-zÀ-ÿ]/;
async function traducir(texto, lang) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=${encodeURIComponent("es|" + lang)}`;
  const r = await fetch(url);
  const j = await r.json();
  const out = j && j.responseData && j.responseData.translatedText;
  if (!out) return null;
  if (/MYMEMORY WARNING|QUERY LENGTH LIMIT|INVALID|IS AN INVALID/i.test(out)) return null;
  return out;
}
export function useTraduccionAutomatica(rootRef, lang) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const saltar = el => el && el.closest && el.closest(".notranslate");
    const nodosTexto = () => {
      const nodos = [];
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(n) {
          const p = n.parentNode;
          if (!p) return NodeFilter.FILTER_REJECT;
          const tag = p.nodeName;
          if (tag === "SCRIPT" || tag === "STYLE" || tag === "TEXTAREA") return NodeFilter.FILTER_REJECT;
          if (saltar(p)) return NodeFilter.FILTER_REJECT;
          const t = n.__es != null ? n.__es : n.nodeValue;
          if (!t || t.trim().length < 2 || !TIENE_LETRA.test(t)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      let cur;
      while (cur = w.nextNode()) nodos.push(cur);
      return nodos;
    };
    const nodosAttr = () => Array.from(root.querySelectorAll("[placeholder], [title]")).filter(el => !saltar(el));
    const revertir = () => {
      for (const n of nodosTexto()) if (n.__es != null && n.nodeValue !== n.__es) n.nodeValue = n.__es;
      for (const el of nodosAttr()) for (const a of ["placeholder", "title"]) {
        const orig = el["__es_" + a];
        if (orig != null && el.getAttribute(a) !== orig) el.setAttribute(a, orig);
      }
    };
    revertir();
    if (!lang || lang === "es") return;
    const cache = cargarCache(lang);
    const pendientes = new Set();
    let raf = null,
      muerto = false;
    const aplicar = () => {
      raf = null;
      const porTraducir = new Set();
      for (const n of nodosTexto()) {
        if (n.__es == null) n.__es = n.nodeValue;
        const key = n.__es.trim();
        if (cache[key] != null) {
          const val = n.__es.replace(key, cache[key]);
          if (n.nodeValue !== val) n.nodeValue = val;
        } else if (!pendientes.has(key)) porTraducir.add(key);
      }
      for (const el of nodosAttr()) for (const a of ["placeholder", "title"]) {
        if (!el.hasAttribute(a)) continue;
        if (el["__es_" + a] == null) el["__es_" + a] = el.getAttribute(a);
        const key = (el["__es_" + a] || "").trim();
        if (!key || !TIENE_LETRA.test(key)) continue;
        if (cache[key] != null) {
          if (el.getAttribute(a) !== cache[key]) el.setAttribute(a, cache[key]);
        } else if (!pendientes.has(key)) porTraducir.add(key);
      }
      if (porTraducir.size) buscar([...porTraducir]);
    };
    const programar = () => {
      if (raf == null) raf = requestAnimationFrame(aplicar);
    };
    const buscar = async keys => {
      for (const k of keys) pendientes.add(k);
      for (const k of keys) {
        if (muerto) return;
        let out = null;
        try {
          out = await traducir(k, lang);
        } catch {}
        cache[k] = out || k;
        pendientes.delete(k);
      }
      guardarCache(lang, cache);
      if (!muerto) programar();
    };
    const obs = new MutationObserver(programar);
    obs.observe(root, {
      childList: true,
      subtree: true,
      characterData: true
    });
    programar();
    return () => {
      muerto = true;
      obs.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [lang, rootRef]);
}
