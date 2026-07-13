import React, { useState, useEffect, useRef, useCallback } from "react";
import { T, btn } from "./theme.js";
import { useAuth } from "../auth/AuthContext.jsx";
import PlayScreen from "./PlayScreen.jsx";
import CampaignScreen from "./CampaignScreen.jsx";
import LoginScreen from "./LoginScreen.jsx";
import OnlineScreen from "./OnlineScreen.jsx";
import RulesScreen from "./RulesScreen.jsx";
import { getLevel } from "../engine/campaign.js";
import { loadLocal, saveLocal, mergeProgress, recordResult } from "../state/store.js";
import { loadCloudProgress, saveCloudProgress } from "../state/cloud.js";
import { IDIOMAS, idiomaInicial, guardarIdioma, useTraduccionAutomatica } from "../i18n/autotranslate.js";
export default function App() {
  const {
    user
  } = useAuth();
  const [screen, setScreen] = useState("menu");
  const [progress, setProgress] = useState(loadLocal);
  const [playCfg, setPlayCfg] = useState(null);
  const [isFs, setIsFs] = useState(false);
  const rootRef = useRef(null);
  const [lang, setLang] = useState(idiomaInicial);
  useTraduccionAutomatica(rootRef, lang);
  useEffect(() => {
    if (!user) return;
    (async () => {
      const cloud = await loadCloudProgress(user.uid);
      const merged = mergeProgress(loadLocal(), cloud);
      setProgress(merged);
      saveLocal(merged);
      saveCloudProgress(user.uid, merged);
    })();
  }, [user]);
  const persist = useCallback(p => {
    setProgress(p);
    saveLocal(p);
    if (user) saveCloudProgress(user.uid, p);
  }, [user]);
  useEffect(() => {
    const h = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);
  const toggleFs = () => {
    if (!document.fullscreenElement) rootRef.current?.requestFullscreen?.();else document.exitFullscreen?.();
  };
  function startLevel(n) {
    const lvl = getLevel(n);
    setPlayCfg({
      mode: lvl.kind === "puzzle" ? "puzzle" : "campaign",
      initial: lvl.start,
      playerColor: lvl.playerColor,
      engineSkill: lvl.engineSkill,
      levelInfo: {
        title: lvl.title,
        goal: lvl.goal,
        mateIn: lvl.mateIn
      },
      level: lvl.level,
      kind: lvl.kind
    });
    setScreen("play");
  }
  function onFinishLevel(result) {
    if (!playCfg) return;
    const mapped = result;
    const p = recordResult(progress, playCfg.level, playCfg.kind, mapped);
    persist(p);
  }
  function startMachine() {
    setPlayCfg({
      mode: "machine",
      initial: null,
      playerColor: "w",
      engineSkill: 9,
      levelInfo: null
    });
    setScreen("play");
  }
  function startTraining() {
    setPlayCfg({
      mode: "training",
      initial: null,
      playerColor: "w",
      engineSkill: 8,
      levelInfo: {
        title: "Entrenamiento",
        goal: "Juega normal. Si hay una jugada mejor que la tuya, te lo explico y puedes deshacer."
      }
    });
    setScreen("play");
  }
  return <div ref={rootRef} style={{
    background: T.ink,
    minHeight: "100%",
    color: T.cream,
    fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
    padding: 16
  }}>
            <div style={{
      maxWidth: 1000,
      margin: "0 auto"
    }}>
                {}
                <div style={{
        display: "flex",
        alignItems: "baseline",
        gap: 12,
        marginBottom: 4,
        flexWrap: "wrap"
      }}>
                    <h1 className="notranslate" style={{
          margin: 0,
          fontSize: "clamp(22px, 6vw, 30px)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          letterSpacing: "-0.5px",
          cursor: "pointer"
        }} onClick={() => setScreen("menu")}>
                        Jaque<span style={{
            color: T.amber
          }}>·</span>
                    </h1>
                    <span style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: 12,
          color: T.muted
        }}>
                        motor propio · campaña · online
                    </span>
                    <div style={{
          marginLeft: "auto",
          display: "flex",
          gap: 8,
          alignItems: "center"
        }}>
                        <select className="notranslate" value={lang} onChange={e => {
            setLang(e.target.value);
            guardarIdioma(e.target.value);
          }} style={{
            ...btn(T.panel, T.cream, T.line),
            padding: "10px 8px",
            cursor: "pointer"
          }}>
                            {Object.keys(IDIOMAS).map(k => <option key={k} value={k}>{IDIOMAS[k]}</option>)}
                        </select>
                        <button onClick={() => setScreen("login")} style={{
            ...btn(T.panel, T.cream, T.line)
          }}>
                            {user ? user.displayName || "Cuenta" : "Entrar"}
                        </button>
                        <button onClick={toggleFs} style={{
            ...btn(T.panel, T.cream, T.line)
          }}>{isFs ? "Salir" : "⛶"}</button>
                    </div>
                </div>
                <div style={{
        height: 1,
        background: T.line,
        marginBottom: 18
      }} />

                {screen === "menu" && <Menu onCampaign={() => setScreen("campaign")} onMachine={startMachine} onTraining={startTraining} onOnline={() => setScreen("online")} onRules={() => setScreen("rules")} onLogin={() => setScreen("login")} progress={progress} />}
                {screen === "campaign" && <CampaignScreen progress={progress} onPlay={startLevel} onExit={() => setScreen("menu")} />}
                {screen === "play" && playCfg && <PlayScreen {...playCfg} onFinish={onFinishLevel} onExit={() => setScreen(playCfg.mode === "campaign" || playCfg.mode === "puzzle" ? "campaign" : "menu")} />}
                {screen === "online" && <OnlineScreen onExit={() => setScreen("menu")} />}
                {screen === "rules" && <RulesScreen onExit={() => setScreen("menu")} />}
                {screen === "login" && <LoginScreen onExit={() => setScreen("menu")} />}
            </div>
        </div>;
}
function Menu({
  onCampaign,
  onMachine,
  onTraining,
  onOnline,
  onRules,
  onLogin,
  progress
}) {
  const card = (title, desc, action, accent) => <button onClick={action} style={{
    textAlign: "left",
    background: T.panel,
    border: `1px solid ${T.line}`,
    borderRadius: 12,
    padding: 18,
    cursor: "pointer",
    color: T.cream,
    display: "block"
  }}>
            <div style={{
      fontSize: 18,
      fontWeight: 700,
      color: accent || T.cream,
      marginBottom: 6,
      fontFamily: "Georgia, serif"
    }}>{title}</div>
            <div style={{
      fontSize: 13,
      color: T.muted,
      lineHeight: 1.5
    }}>{desc}</div>
        </button>;
  return <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12
  }}>
            {card("Campaña", `1000 niveles que suben de dificultad. Vas por el nivel ${progress.unlockedLevel || 1}.`, onCampaign, T.amber)}
            {card("Jugar vs máquina", "Partida libre con 5 niveles de dificultad, del principiante al maestro.", onMachine)}
            {card("Entrenamiento", "Juega y, si hay una jugada mejor, el entrenador te la explica y puedes deshacer.", onTraining, T.green)}
            {card("Jugar online", "Partida rápida, o con un amigo por código, y chat en directo.", onOnline)}
            {card("Aprende a jugar", "Todas las reglas del ajedrez, con tableros animados.", onRules)}
            {card("Tu cuenta", "Google, Facebook o email. Guarda tu progreso en la nube.", onLogin)}
        </div>;
}
