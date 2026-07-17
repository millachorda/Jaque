import React, { useState, useEffect, useCallback, useRef } from "react";
import Board from "./Board.jsx";
import { Piece } from "./Pieces.jsx";
import { T, btn } from "./theme.js";
import { makeStartBoard, applyMove, legalMoves, pieceMoves, inCheck, findKing, enemy, Value, think, gameStatus, analyzeMove } from "../engine/engine.js";
const DIFF = {
  "1": 2,
  "2": 6,
  "3": 10,
  "4": 15,
  "5": 20
};
const DIFF_LABEL = {
  "1": "Principiante",
  "2": "Fácil",
  "3": "Intermedio",
  "4": "Avanzado",
  "5": "Maestro"
};
export default function PlayScreen({
  mode,
  initial,
  playerColor: pc,
  engineSkill,
  levelInfo,
  onExit,
  onFinish,
  resume,
  onSnapshot
}) {
  const R = resume || null;
  const [playerColor, setPlayerColor] = useState(R ? R.playerColor : pc || "w");
  const [diff, setDiff] = useState(R ? R.diff : "3");
  const skill = mode === "machine" ? DIFF[diff] : engineSkill;
  const aiColor = enemy(playerColor);
  const startBoard = () => initial && initial.board ? initial.board.map(r => r.map(p => p ? {
    ...p
  } : null)) : makeStartBoard();
  const startCastling = () => initial && initial.castling ? {
    ...initial.castling
  } : {
    wK: true,
    wQ: true,
    bK: true,
    bQ: true
  };
  const [board, setBoard] = useState(() => R ? R.board : startBoard());
  const [turn, setTurn] = useState(R ? R.turn : initial && initial.turn ? initial.turn : "w");
  const [castling, setCastling] = useState(() => R ? R.castling : startCastling());
  const [enPassant, setEnPassant] = useState(R ? R.enPassant : initial && initial.enPassant ? initial.enPassant : null);
  const [selected, setSelected] = useState(null);
  const [legal, setLegal] = useState([]);
  const [lastMove, setLastMove] = useState(R ? R.lastMove : null);
  const [captured, setCaptured] = useState(() => R ? R.captured : {
    w: [],
    b: []
  });
  const [status, setStatus] = useState(R ? R.status : "playing");
  const [thinking, setThinking] = useState(false);
  const [telemetry, setTelemetry] = useState({
    eval: 0,
    depth: 0,
    nodes: 0,
    ms: 0
  });
  const [anim, setAnim] = useState(null);
  const [finished, setFinished] = useState(null);
  const [playerMoves, setPlayerMoves] = useState(R ? R.playerMoves : 0);
  const [coach, setCoach] = useState(null);
  const [pending, setPending] = useState(null);
  const [history, setHistory] = useState(() => R ? R.history : []);
  const boardRef = useRef(board);
  const stateRef = useRef({
    castling,
    enPassant
  });
  const animId = useRef(0);
  stateRef.current = {
    castling,
    enPassant
  };
  const doMove = useCallback((move, b, cas, ep, capState) => {
    const next = applyMove(b, move, cas, ep);
    const moverColor = b[move.from[0]][move.from[1]].color;
    const newCap = {
      ...capState
    };
    if (move.captured) newCap[enemy(moverColor)] = [...newCap[enemy(moverColor)], move.captured];
    const nextTurn = enemy(moverColor);
    const st = gameStatus(next.board, nextTurn, next.castling, next.enPassant);
    setBoard(next.board);
    boardRef.current = next.board;
    setCastling(next.castling);
    setEnPassant(next.enPassant);
    setTurn(nextTurn);
    setLastMove({
      from: move.from,
      to: move.to
    });
    setCaptured(newCap);
    setStatus(st);
    setSelected(null);
    setLegal([]);
    animId.current += 1;
    setAnim({
      key: animId.current,
      settled: false,
      fromR: move.from[0],
      fromC: move.from[1],
      toR: move.to[0],
      toC: move.to[1]
    });
    if (moverColor === playerColor) setPlayerMoves(n => n + 1);
    return {
      ...next,
      turn: nextTurn,
      captured: newCap,
      status: st,
      moverColor
    };
  }, [playerColor]);
  useEffect(() => {
    if (!anim || anim.settled) return;
    let id2;
    const id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => {
        setAnim(a => a && a.key === anim.key ? {
          ...a,
          settled: true
        } : a);
      });
    });
    return () => {
      cancelAnimationFrame(id1);
      if (id2) cancelAnimationFrame(id2);
    };
  }, [anim ? anim.key : null]);
  useEffect(() => {
    if (finished) return;
    if (coach || pending) return;
    if (turn !== aiColor) return;
    if (status === "checkmate" || status === "stalemate") return;
    setThinking(true);
    let moveTimer;
    const calcTimer = setTimeout(() => {
      const st = {
        board: boardRef.current,
        turn: aiColor,
        castling: stateRef.current.castling,
        enPassant: stateRef.current.enPassant
      };
      const {
        move,
        score,
        nodes,
        depth,
        ms
      } = think(st, {
        skill
      });
      setTelemetry({
        eval: score,
        depth,
        nodes,
        ms
      });
      const wait = Math.max(0, 350 - ms);
      moveTimer = setTimeout(() => {
        if (move) doMove(move, boardRef.current, stateRef.current.castling, stateRef.current.enPassant, capturedRef.current);
        setThinking(false);
      }, wait);
    }, 60);
    return () => {
      clearTimeout(calcTimer);
      clearTimeout(moveTimer);
    };
  }, [turn, status, aiColor, skill, finished, coach, pending]);
  const capturedRef = useRef(captured);
  capturedRef.current = captured;
  useEffect(() => {
    if (finished) return;
    if (mode === "machine") return;
    if (status === "checkmate") {
      const result = turn === playerColor ? "loss" : "win";
      endWith(result);
    } else if (status === "stalemate") {
      endWith(mode === "puzzle" ? "loss" : "draw");
    } else if (mode === "puzzle" && playerMoves >= (levelInfo?.mateIn || 99) && turn === playerColor) {
      endWith("loss");
    }
  }, [status, turn, playerMoves]);
  function endWith(result) {
    setFinished(result);
    setThinking(false);
    if (onFinish) onFinish(result);
  }
  useEffect(() => {
    if (!onSnapshot) return;
    if (finished || status === "checkmate" || status === "stalemate") {
      onSnapshot(null);
      return;
    }
    onSnapshot({
      board,
      turn,
      castling,
      enPassant,
      lastMove,
      captured,
      status,
      playerMoves,
      history,
      diff,
      playerColor
    });
  }, [board, turn, castling, enPassant, lastMove, captured, status, playerMoves, history, diff, playerColor, finished, onSnapshot]);
  useEffect(() => {
    if (!pending) return;
    const id = setTimeout(() => {
      const a = analyzeMove(pending.state, pending.move, {
        maxDepth: 3,
        timeMs: 700
      });
      if (a && a.betterExists) setCoach({
        explanation: a.explanation,
        bestSan: a.bestSan
      });else setPending(null);
    }, 40);
    return () => clearTimeout(id);
  }, [pending]);
  function undoTraining() {
    setHistory(h => {
      if (h.length === 0) return h;
      const snap = h[h.length - 1];
      setBoard(snap.board);
      boardRef.current = snap.board;
      setTurn(snap.turn);
      setCastling(snap.castling);
      setEnPassant(snap.enPassant);
      setCaptured(snap.captured);
      setLastMove(snap.lastMove);
      setPlayerMoves(snap.playerMoves);
      setSelected(null);
      setLegal([]);
      setAnim(null);
      setStatus(gameStatus(snap.board, snap.turn, snap.castling, snap.enPassant));
      return h.slice(0, -1);
    });
    setCoach(null);
    setPending(null);
  }
  function continueTraining() {
    setCoach(null);
    setPending(null);
  }
  function onSquare(r, c) {
    if (thinking || finished || coach || pending) return;
    if (turn !== playerColor) return;
    if (status === "checkmate" || status === "stalemate") return;
    const piece = board[r][c];
    if (selected) {
      const move = legal.find(m => m.to[0] === r && m.to[1] === c);
      if (move) {
        if (mode === "training") {
          const snap = {
            board,
            turn,
            castling,
            enPassant,
            captured,
            lastMove,
            playerMoves
          };
          const preState = {
            board,
            turn: playerColor,
            castling,
            enPassant
          };
          setHistory(h => [...h, snap]);
          doMove(move, board, castling, enPassant, captured);
          setPending({
            state: preState,
            move
          });
          return;
        }
        doMove(move, board, castling, enPassant, captured);
        return;
      }
    }
    if (piece && piece.color === playerColor) {
      const all = pieceMoves(board, r, c, enPassant, castling).filter(m => {
        const n = applyMove(board, m, castling, enPassant);
        return !inCheck(n.board, playerColor);
      });
      setSelected([r, c]);
      setLegal(all);
    } else {
      setSelected(null);
      setLegal([]);
    }
  }
  function reset(color = playerColor) {
    setBoard(startBoard());
    boardRef.current = startBoard();
    setTurn(initial && initial.turn ? initial.turn : "w");
    setCastling(startCastling());
    setEnPassant(initial && initial.enPassant ? initial.enPassant : null);
    setSelected(null);
    setLegal([]);
    setLastMove(null);
    setCaptured({
      w: [],
      b: []
    });
    setStatus("playing");
    setThinking(false);
    setTelemetry({
      eval: 0,
      depth: 0,
      nodes: 0,
      ms: 0
    });
    setAnim(null);
    setFinished(null);
    setPlayerMoves(0);
    setCoach(null);
    setPending(null);
    setHistory([]);
    setPlayerColor(color);
  }
  const flip = playerColor === "b";
  const checkSq = status === "check" ? findKing(board, turn) : null;
  const machKey = aiColor === "w" ? "b" : "w";
  const playKey = playerColor === "w" ? "b" : "w";
  const material = arr => arr.reduce((s, t) => s + Value[t], 0);
  const playerAdv = (material(captured[playKey]) - material(captured[machKey])) / 100;
  const evalForPlayer = playerColor === "w" ? telemetry.eval : -telemetry.eval;
  const evalPct = Math.max(2, Math.min(98, 50 + evalForPlayer / 40));
  let banner;
  if (finished === "win") banner = "¡Victoria!";else if (finished === "loss") banner = mode === "puzzle" ? "No es la solución. Reinténtalo." : "Has perdido";else if (finished === "draw") banner = "Tablas";else if (status === "checkmate") banner = turn === playerColor ? "Jaque mate - Has perdido" : "Jaque mate - Has ganado";else if (status === "stalemate") banner = "Tablas - ahogado";else if (status === "check") banner = turn === playerColor ? "¡Estás en jaque!" : "Jaque a la máquina";else if (thinking) banner = "La máquina está pensando...";else banner = turn === playerColor ? "Tu turno" : "Turno de la máquina";
  return <div style={{
    display: "flex",
    gap: 20,
    flexWrap: "wrap",
    alignItems: "flex-start"
  }}>
            <div>
                <Board board={board} flip={flip} selected={selected} legal={legal} lastMove={lastMove} checkSq={checkSq} anim={anim} onSquare={onSquare} />
                <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: 8,
        minHeight: 26,
        gap: 8
      }}>
                    <div style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1
        }}>
                        {captured[machKey].map((t, i) => <Piece key={i} type={t} color={machKey} size={22} />)}
                        {playerAdv < 0 && <span style={{
            marginLeft: 5,
            fontSize: 13,
            fontWeight: 700,
            color: T.muted
          }}>+{-playerAdv}</span>}
                    </div>
                    <div style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1
        }}>
                        {captured[playKey].map((t, i) => <Piece key={i} type={t} color={playKey} size={22} />)}
                        {playerAdv > 0 && <span style={{
            marginLeft: 5,
            fontSize: 13,
            fontWeight: 700,
            color: "#9fd0a0"
          }}>+{playerAdv}</span>}
                    </div>
                </div>
            </div>

            <div style={{
      flex: "1 1 260px",
      minWidth: 240
    }}>
                {levelInfo && <div style={{
        background: T.panel,
        border: `1px solid ${T.line}`,
        borderRadius: 8,
        padding: "12px 14px",
        marginBottom: 14
      }}>
                        <div style={{
          color: T.amber,
          fontWeight: 700,
          fontSize: 14
        }}>{levelInfo.title}</div>
                        <div style={{
          color: T.muted,
          fontSize: 12,
          marginTop: 4
        }}>{levelInfo.goal}</div>
                    </div>}

                {mode === "training" && pending && !coach && <div style={{
        background: T.panel,
        border: `1px solid ${T.line}`,
        borderRadius: 8,
        padding: "12px 14px",
        marginBottom: 14,
        color: T.muted,
        fontSize: 13
      }}>
                        Analizando tu jugada…
                    </div>}
                {coach && <div style={{
        background: "#241f10",
        border: `1px solid ${T.amber}`,
        borderRadius: 8,
        padding: "12px 14px",
        marginBottom: 14
      }}>
                        <div style={{
          color: T.amber,
          fontWeight: 700,
          marginBottom: 6,
          display: "flex",
          alignItems: "center",
          gap: 6
        }}>
                            <span>💡 Entrenador</span>
                        </div>
                        <div style={{
          color: T.cream,
          fontSize: 13,
          lineHeight: 1.5,
          marginBottom: 10
        }}>{coach.explanation}</div>
                        <div style={{
          display: "flex",
          gap: 6
        }}>
                            <button onClick={undoTraining} style={{
            ...btn(T.amber, T.ink),
            flex: 1
          }}>Deshacer y probar</button>
                            <button onClick={continueTraining} style={{
            ...btn("transparent", T.cream, T.line),
            flex: 1
          }}>Seguir así</button>
                        </div>
                    </div>}

                <div style={{
        background: T.panel,
        border: `1px solid ${T.line}`,
        borderRadius: 8,
        padding: "12px 14px",
        marginBottom: 14
      }}>
                    <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 15,
          fontWeight: 600,
          marginBottom: 6
        }}>
                        <span style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            flexShrink: 0,
            background: finished === "win" ? T.green : finished ? T.danger : status === "check" ? T.danger : turn === playerColor ? T.green : T.amber
          }} />
                        <span>{banner}</span>
                    </div>
                    <div style={{
          fontSize: 11,
          color: T.muted,
          marginBottom: 4,
          fontFamily: "ui-monospace, monospace"
        }}>ventaja</div>
                    <div style={{
          height: 10,
          background: "#23262b",
          borderRadius: 5,
          overflow: "hidden"
        }}>
                        <div style={{
            width: `${evalPct}%`,
            height: "100%",
            background: T.amber,
            transition: "width .3s"
          }} />
                    </div>
                </div>

                <div style={{
        background: "#0f1216",
        border: `1px solid ${T.line}`,
        borderRadius: 8,
        padding: "12px 14px",
        marginBottom: 14,
        fontFamily: "ui-monospace, monospace",
        fontSize: 12,
        color: "#9fd0a0"
      }}>
                    <div style={{
          color: T.amber,
          marginBottom: 8,
          letterSpacing: 1
        }}>CEREBRO DEL MOTOR</div>
                    <Row k="fuerza" v={`skill ${skill}/20`} />
                    <Row k="profundidad" v={`${telemetry.depth} jugadas`} />
                    <Row k="posiciones" v={telemetry.nodes.toLocaleString("es")} />
                    <Row k="tiempo" v={`${telemetry.ms} ms`} />
                    <Row k="evaluación" v={(telemetry.eval / 100).toFixed(2)} />
                </div>

                {mode === "machine" && <div style={{
        marginBottom: 10
      }}>
                        <label style={{
          fontSize: 12,
          color: T.muted,
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 5
        }}>
                            <span>Dificultad</span>
                            <span style={{
            color: T.amber
          }}>{DIFF_LABEL[diff]}</span>
                        </label>
                        <div style={{
          display: "flex",
          gap: 6
        }}>
                            {Object.keys(DIFF).map(lv => <button key={lv} onClick={() => setDiff(lv)} title={DIFF_LABEL[lv]} style={{
            ...btn(diff === lv ? T.amber : "transparent", diff === lv ? T.ink : T.cream, diff === lv ? T.amber : T.line),
            flex: 1,
            padding: "11px 0",
            fontSize: 15
          }}>{lv}</button>)}
                        </div>
                    </div>}

                <div style={{
        display: "flex",
        gap: 6,
        flexWrap: "wrap"
      }}>
                    {(finished || mode !== "puzzle") && <button onClick={() => reset(playerColor)} style={{
          ...btn(T.amber, T.ink),
          flex: 1
        }}>
                            {mode === "puzzle" ? "Reintentar" : "Reiniciar"}
                        </button>}
                    {mode === "machine" && <button onClick={() => reset(enemy(playerColor))} style={{
          ...btn("transparent", T.cream, T.line),
          flex: 1
        }}>Cambiar color</button>}
                    <button onClick={onExit} style={{
          ...btn("transparent", T.cream, T.line),
          flex: 1
        }}>
                        {mode === "machine" ? "Menú" : "Volver al mapa"}
                    </button>
                </div>

                {finished === "win" && mode !== "machine" && <div style={{
        marginTop: 12,
        color: T.green,
        fontWeight: 700
      }}>Nivel superado ✓</div>}
            </div>
        </div>;
}
function Row({
  k,
  v
}) {
  return <div style={{
    display: "flex",
    justifyContent: "space-between",
    padding: "2px 0"
  }}>
            <span style={{
      color: "#6f7886"
    }}>{k}</span><span>{v}</span>
        </div>;
}