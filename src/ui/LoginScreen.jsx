import React, { useState } from "react";
import { T, btn } from "./theme.js";
import { useAuth } from "../auth/AuthContext.jsx";
export default function LoginScreen({
  onExit
}) {
  const auth = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function run(fn) {
    setError("");
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setError(e.message || "Error");
    } finally {
      setBusy(false);
    }
  }
  const input = {
    width: "100%",
    padding: "11px 12px",
    borderRadius: 7,
    marginBottom: 10,
    boxSizing: "border-box",
    background: "#0f1216",
    border: `1px solid ${T.line}`,
    color: T.cream,
    fontSize: 14
  };
  if (!auth.configured) {
    return <Panel onExit={onExit}>
                <p style={{
        color: T.cream,
        lineHeight: 1.6
      }}>
                    El inicio de sesión y el juego online todavía no están activados.
                    Para encenderlos, configura tu proyecto Firebase en <code>src/auth/firebase.js</code>
                    (mira <code>README_SETUP.md</code>). Mientras tanto, la campaña y el juego
                    contra la máquina funcionan sin cuenta.
                </p>
            </Panel>;
  }
  if (auth.user) {
    return <Panel onExit={onExit}>
                <p style={{
        color: T.cream
      }}>Sesión iniciada como <b>{auth.user.displayName || auth.user.email}</b>.</p>
                <button style={{
        ...btn(T.danger, "#fff"),
        width: "100%"
      }} onClick={() => run(auth.logout)}>Cerrar sesión</button>
            </Panel>;
  }
  return <Panel onExit={onExit}>
            <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 8,
      marginBottom: 14
    }}>
                <button disabled={busy} style={{
        ...btn("#fff", "#1f1f1f")
      }} onClick={() => run(auth.signInGoogle)}>Continuar con Google</button>
                <button disabled={busy} style={{
        ...btn("#1877f2", "#fff")
      }} onClick={() => run(auth.signInFacebook)}>Continuar con Facebook</button>
            </div>

            <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      margin: "10px 0"
    }}>
                <div style={{
        flex: 1,
        height: 1,
        background: T.line
      }} />
                <span style={{
        color: T.muted,
        fontSize: 12
      }}>o con email</span>
                <div style={{
        flex: 1,
        height: 1,
        background: T.line
      }} />
            </div>

            {mode === "register" && <input style={input} placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} />}
            <input style={input} placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <input style={input} placeholder="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} />

            {error && <div style={{
      color: T.danger,
      fontSize: 13,
      marginBottom: 10
    }}>{error}</div>}

            <button disabled={busy} style={{
      ...btn(T.amber, T.ink),
      width: "100%",
      marginBottom: 8
    }} onClick={() => run(() => mode === "login" ? auth.signInEmail(email, password) : auth.registerEmail(email, password, name))}>
                {mode === "login" ? "Entrar" : "Crear cuenta"}
            </button>
            <button style={{
      background: "none",
      border: "none",
      color: T.muted,
      cursor: "pointer",
      fontSize: 13,
      width: "100%"
    }} onClick={() => {
      setMode(mode === "login" ? "register" : "login");
      setError("");
    }}>
                {mode === "login" ? "¿No tienes cuenta? Regístrate" : "Ya tengo cuenta"}
            </button>
        </Panel>;
}
function Panel({
  children,
  onExit
}) {
  return <div style={{
    maxWidth: 380,
    margin: "0 auto"
  }}>
            <div style={{
      display: "flex",
      alignItems: "center",
      marginBottom: 14
    }}>
                <h2 style={{
        margin: 0,
        fontFamily: "Georgia, serif"
      }}>Tu cuenta</h2>
                <button onClick={onExit} style={{
        ...btn("transparent", T.cream, T.line),
        marginLeft: "auto"
      }}>Menú</button>
            </div>
            <div style={{
      background: T.panel,
      border: `1px solid ${T.line}`,
      borderRadius: 10,
      padding: 18
    }}>{children}</div>
        </div>;
}
