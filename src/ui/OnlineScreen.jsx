import React, { useState, useEffect, useRef } from "react";
import Board from "./Board.jsx";
import { T, btn } from "./theme.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { pieceMoves, applyMove, inCheck, findKing, gameStatus } from "../engine/engine.js";
import { findOrJoinGame, createPrivateGame, joinByCode, subscribeGame, sendMove, resignGame, sendChat, subscribeChat } from "../online/online.js";
export default function OnlineScreen({
  onExit
}) {
  const {
    user,
    configured
  } = useAuth();
  const [phase, setPhase] = useState("idle");
  const [game, setGame] = useState(null);
  const [myColor, setMyColor] = useState("w");
  const [code, setCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [legal, setLegal] = useState([]);
  const [chat, setChat] = useState([]);
  const [msg, setMsg] = useState("");
  const unsubRef = useRef([]);
  const chatEndRef = useRef(null);
  useEffect(() => () => {
    unsubRef.current.forEach(u => u && u());
  }, []);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [chat]);
  function attach(gameId, color, isFriend) {
    setMyColor(color);
    const u1 = subscribeGame(gameId, g => {
      setGame(g);
      setPhase(g.status === "waiting" ? isFriend ? "waitingFriend" : "searching" : "playing");
    });
    const u2 = subscribeChat(gameId, setChat);
    unsubRef.current = [u1, u2];
  }
  async function quickMatch() {
    setError("");
    setPhase("searching");
    try {
      const {
        gameId,
        color
      } = await findOrJoinGame(user);
      attach(gameId, color, false);
    } catch (e) {
      setError(e.message);
      setPhase("error");
    }
  }
  async function friendGame() {
    setError("");
    try {
      const {
        gameId,
        color,
        code
      } = await createPrivateGame(user);
      setCode(code);
      setPhase("waitingFriend");
      attach(gameId, color, true);
    } catch (e) {
      setError(e.message);
      setPhase("error");
    }
  }
  async function joinFriend() {
    setError("");
    try {
      const {
        gameId,
        color
      } = await joinByCode(user, joinCode);
      attach(gameId, color, false);
      setPhase("playing");
    } catch (e) {
      setError(e.message);
    }
  }
  function onSquare(r, c) {
    if (!game || game.status !== "active" || game.turn !== myColor) return;
    const piece = game.board[r][c];
    if (selected) {
      const move = legal.find(m => m.to[0] === r && m.to[1] === c);
      if (move) {
        setSelected(null);
        setLegal([]);
        sendMove(game, move, myColor).catch(e => setError(e.message));
        return;
      }
    }
    if (piece && piece.color === myColor) {
      const all = pieceMoves(game.board, r, c, game.enPassant, game.castling).filter(m => {
        const n = applyMove(game.board, m, game.castling, game.enPassant);
        return !inCheck(n.board, myColor);
      });
      setSelected([r, c]);
      setLegal(all);
    } else {
      setSelected(null);
      setLegal([]);
    }
  }
  function send() {
    const t = msg;
    setMsg("");
    sendChat(game.id, user, t).catch(() => {});
  }
  if (!configured) return <Wrap onExit={onExit}><Info>El juego online necesita configurar Firebase (ver <code>README_SETUP.md</code>).</Info></Wrap>;
  if (!user) return <Wrap onExit={onExit}><Info>Inicia sesión para jugar online.</Info></Wrap>;
  if (phase === "idle") {
    return <Wrap onExit={onExit}>
                <div style={{
        display: "flex",
        flexDirection: "column",
        gap: 10
      }}>
                    <button style={{
          ...btn(T.amber, T.ink)
        }} onClick={quickMatch}>Partida rápida (buscar rival)</button>
                    <button style={{
          ...btn(T.panel, T.cream, T.line)
        }} onClick={friendGame}>Crear partida con un amigo</button>
                    <div style={{
          display: "flex",
          gap: 6
        }}>
                        <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="CÓDIGO" maxLength={5} style={{
            flex: 1,
            padding: "11px 12px",
            borderRadius: 7,
            background: "#0f1216",
            border: `1px solid ${T.line}`,
            color: T.cream,
            letterSpacing: 3,
            textAlign: "center",
            fontWeight: 700
          }} />
                        <button style={{
            ...btn(T.panel, T.cream, T.line)
          }} onClick={joinFriend} disabled={joinCode.length < 5}>Unirme</button>
                    </div>
                </div>
                {error && <Info style={{
        color: T.danger,
        marginTop: 12
      }}>{error}</Info>}
            </Wrap>;
  }
  if (phase === "searching") return <Wrap onExit={onExit}><Info>Buscando rival… déjalo abierto. Juegas con {myColor === "w" ? "blancas" : "negras"}.</Info></Wrap>;
  if (phase === "waitingFriend") {
    return <Wrap onExit={onExit}>
                <Info>
                    Comparte este código con tu amigo. Cuando entre, empezáis:
                    <div style={{
          fontSize: 34,
          letterSpacing: 6,
          fontWeight: 800,
          color: T.amber,
          textAlign: "center",
          margin: "14px 0"
        }}>{code}</div>
                    Juegas con blancas.
                </Info>
            </Wrap>;
  }
  if (phase === "error") return <Wrap onExit={onExit}><Info style={{
      color: T.danger
    }}>{error}</Info></Wrap>;
  const flip = myColor === "b";
  const status = game ? gameStatus(game.board, game.turn, game.castling, game.enPassant) : "playing";
  const checkSq = status === "check" ? findKing(game.board, game.turn) : null;
  const lastMove = game?.lastMove ? {
    from: [game.lastMove[0], game.lastMove[1]],
    to: [game.lastMove[2], game.lastMove[3]]
  } : null;
  let banner;
  if (game?.status === "finished") banner = game.result === "draw" ? "Tablas" : game.result === myColor ? "¡Has ganado!" : "Has perdido";else if (game?.turn === myColor) banner = "Tu turno";else banner = `Turno de ${game?.names?.[game.turn] || "tu rival"}`;
  return <Wrap onExit={onExit} wide>
            <div style={{
      display: "flex",
      gap: 20,
      flexWrap: "wrap",
      alignItems: "flex-start"
    }}>
                <Board board={game.board} flip={flip} selected={selected} legal={legal} lastMove={lastMove} checkSq={checkSq} anim={null} onSquare={onSquare} maxWidth={480} />
                <div style={{
        flex: "1 1 260px",
        minWidth: 240,
        display: "flex",
        flexDirection: "column",
        gap: 12
      }}>
                    <div style={{
          background: T.panel,
          border: `1px solid ${T.line}`,
          borderRadius: 8,
          padding: "12px 14px"
        }}>
                        <div style={{
            fontWeight: 700,
            marginBottom: 6
          }}>{banner}</div>
                        <div style={{
            fontSize: 12,
            color: T.muted
          }}>Blancas: {game.names?.w || "—"} · Negras: {game.names?.b || "—"}</div>
                    </div>

                    {}
                    <div style={{
          background: "#0f1216",
          border: `1px solid ${T.line}`,
          borderRadius: 8,
          display: "flex",
          flexDirection: "column",
          height: 260
        }}>
                        <div style={{
            color: T.amber,
            fontSize: 12,
            letterSpacing: 1,
            padding: "8px 12px",
            borderBottom: `1px solid ${T.line}`
          }}>CHAT</div>
                        <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "8px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 6
          }}>
                            {chat.length === 0 && <div style={{
              color: T.muted,
              fontSize: 12
            }}>Saluda a tu rival 👋</div>}
                            {chat.map(m => <div key={m.id} style={{
              fontSize: 13
            }}>
                                    <span style={{
                color: m.uid === user.uid ? T.green : T.amber,
                fontWeight: 700
              }}>{m.name}: </span>
                                    <span style={{
                color: T.cream
              }}>{m.text}</span>
                                </div>)}
                            <div ref={chatEndRef} />
                        </div>
                        <div style={{
            display: "flex",
            gap: 6,
            padding: 8,
            borderTop: `1px solid ${T.line}`
          }}>
                            <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Escribe…" style={{
              flex: 1,
              padding: "9px 10px",
              borderRadius: 6,
              background: T.ink,
              border: `1px solid ${T.line}`,
              color: T.cream,
              fontSize: 13
            }} />
                            <button style={{
              ...btn(T.amber, T.ink),
              padding: "9px 12px"
            }} onClick={send}>Enviar</button>
                        </div>
                    </div>

                    {error && <div style={{
          color: T.danger,
          fontSize: 13
        }}>{error}</div>}
                    {game.status !== "finished" && <button style={{
          ...btn("transparent", T.danger, T.danger)
        }} onClick={() => resignGame(game, myColor).catch(e => setError(e.message))}>Abandonar</button>}
                </div>
            </div>
        </Wrap>;
}
function Wrap({
  children,
  onExit,
  wide
}) {
  return <div style={{
    maxWidth: wide ? 1000 : 420,
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
      }}>Jugar online</h2>
                <button onClick={onExit} style={{
        ...btn("transparent", T.cream, T.line),
        marginLeft: "auto"
      }}>Menú</button>
            </div>
            {children}
        </div>;
}
function Info({
  children,
  style
}) {
  return <div style={{
    background: T.panel,
    border: `1px solid ${T.line}`,
    borderRadius: 8,
    padding: 16,
    color: T.cream,
    lineHeight: 1.6,
    ...style
  }}>{children}</div>;
}
