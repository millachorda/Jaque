import React, { useState, useEffect } from "react";
import { T, btn } from "./theme.js";
import { Piece } from "./Pieces.jsx";
import { pieceMoves } from "../engine/engine.js";
function AnimBoard({
  n = 8,
  cell = 34,
  pieces,
  script = [],
  highlights = []
}) {
  const initial = () => Object.fromEntries(pieces.map(p => [p.id, [p.r, p.c]]));
  const [pos, setPos] = useState(initial);
  useEffect(() => {
    let i = 0,
      alive = true,
      timer;
    const step = () => {
      if (!alive) return;
      if (i >= script.length) {
        timer = setTimeout(() => {
          if (!alive) return;
          setPos(initial());
          i = 0;
          timer = setTimeout(step, 900);
        }, 1400);
        return;
      }
      const s = script[i++];
      setPos(prev => {
        const next = {
          ...prev
        };
        for (const mv of s) next[mv.id] = mv.to;
        return next;
      });
      timer = setTimeout(step, 1050);
    };
    timer = setTimeout(step, 600);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [JSON.stringify(script), JSON.stringify(pieces)]);
  const size = n * cell;
  const byId = pieces.reduce((m, p) => {
    m[p.id] = p;
    return m;
  }, {});
  const hi = new Set(highlights.map(([r, c]) => r + "," + c));
  return <div style={{
    position: "relative",
    width: size,
    height: size,
    borderRadius: 6,
    overflow: "hidden",
    border: `4px solid ${T.dark}`,
    flexShrink: 0
  }}>
            {Array.from({
      length: n
    }).map((_, r) => Array.from({
      length: n
    }).map((_, c) => <div key={r + "-" + c} style={{
      position: "absolute",
      left: c * cell,
      top: r * cell,
      width: cell,
      height: cell,
      background: (r + c) % 2 ? T.dark : T.light
    }}>
                        {hi.has(r + "," + c) && <span style={{
        position: "absolute",
        inset: "34%",
        borderRadius: "50%",
        background: "rgba(224,162,58,.7)"
      }} />}
                    </div>))}
            {pieces.map(p => {
      const [r, c] = pos[p.id] || [p.r, p.c];
      return <div key={p.id} style={{
        position: "absolute",
        width: cell,
        height: cell,
        transform: `translate(${c * cell}px, ${r * cell}px)`,
        transition: "transform .55s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2
      }}>
                        <Piece type={byId[p.id].type} color={byId[p.id].color} size="82%" />
                    </div>;
    })}
        </div>;
}
function moveDemo(type, color = "w") {
  const board = Array.from({
    length: 8
  }, () => Array(8).fill(null));
  const r0 = 4,
    c0 = 4;
  board[r0][c0] = {
    type,
    color
  };
  if (type === "p") {
    board[r0 - 1][c0 - 1] = {
      type: "p",
      color: "b"
    };
    board[r0 - 1][c0 + 1] = {
      type: "n",
      color: "b"
    };
  }
  const targets = pieceMoves(board, r0, c0, null, {
    wK: 0,
    wQ: 0,
    bK: 0,
    bQ: 0
  }).map(m => m.to);
  const pieces = [{
    id: "p0",
    type,
    color,
    r: r0,
    c: c0
  }];
  if (type === "p") {
    pieces.push({
      id: "e1",
      type: "p",
      color: "b",
      r: r0 - 1,
      c: c0 - 1
    }, {
      id: "e2",
      type: "n",
      color: "b",
      r: r0 - 1,
      c: c0 + 1
    });
  }
  const script = [];
  for (const t of targets) {
    script.push([{
      id: "p0",
      to: t
    }]);
    script.push([{
      id: "p0",
      to: [r0, c0]
    }]);
  }
  return {
    pieces,
    script,
    highlights: targets
  };
}
const PIECE_INFO = {
  p: ["Peón", "Avanza una casilla (o dos en su primer movimiento) y captura en diagonal. Nunca retrocede."],
  n: ["Caballo", "Se mueve en forma de L y es la única pieza que salta sobre otras."],
  b: ["Alfil", "Se mueve en diagonal, tantas casillas como quiera. Cada alfil vive en un color."],
  r: ["Torre", "Se mueve en líneas rectas: horizontal y vertical."],
  q: ["Dama", "La más poderosa: combina torre y alfil en todas las direcciones."],
  k: ["Rey", "Se mueve una casilla en cualquier dirección. Protegerlo es el objetivo del juego."]
};
function Lesson({
  title,
  children,
  demo
}) {
  return <div style={{
    background: T.panel,
    border: `1px solid ${T.line}`,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12
  }}>
            <div style={{
      fontFamily: "Georgia, serif",
      fontSize: 18,
      fontWeight: 700,
      color: T.amber,
      marginBottom: 8
    }}>{title}</div>
            <div style={{
      display: "flex",
      gap: 16,
      flexWrap: "wrap",
      alignItems: "center"
    }}>
                {demo && <AnimBoard {...demo} />}
                <div style={{
        flex: "1 1 220px",
        color: T.cream,
        fontSize: 14,
        lineHeight: 1.6
      }}>{children}</div>
            </div>
        </div>;
}
export default function RulesScreen({
  onExit
}) {
  const [tab, setTab] = useState("piezas");
  const castleDemo = {
    pieces: [{
      id: "k",
      type: "k",
      color: "w",
      r: 7,
      c: 4
    }, {
      id: "r",
      type: "r",
      color: "w",
      r: 7,
      c: 7
    }],
    script: [[{
      id: "k",
      to: [7, 6]
    }, {
      id: "r",
      to: [7, 5]
    }]],
    highlights: [[7, 6], [7, 5]]
  };
  const epDemo = {
    pieces: [{
      id: "w",
      type: "p",
      color: "w",
      r: 3,
      c: 3
    }, {
      id: "b",
      type: "p",
      color: "b",
      r: 1,
      c: 4
    }],
    script: [[{
      id: "b",
      to: [3, 4]
    }], [{
      id: "w",
      to: [2, 4]
    }, {
      id: "b",
      to: [8, 8]
    }]],
    highlights: [[2, 4]]
  };
  const promoDemo = {
    pieces: [{
      id: "p",
      type: "p",
      color: "w",
      r: 1,
      c: 3
    }, {
      id: "q",
      type: "q",
      color: "w",
      r: 8,
      c: 8
    }],
    script: [[{
      id: "p",
      to: [8, 8]
    }, {
      id: "q",
      to: [0, 3]
    }]],
    highlights: [[0, 3]]
  };
  return <div>
            <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      marginBottom: 14,
      flexWrap: "wrap"
    }}>
                <h2 style={{
        margin: 0,
        fontFamily: "Georgia, serif"
      }}>Aprende a jugar</h2>
                <button onClick={onExit} style={{
        ...btn("transparent", T.cream, T.line),
        marginLeft: "auto"
      }}>Menú</button>
            </div>

            <div style={{
      display: "flex",
      gap: 6,
      marginBottom: 14,
      flexWrap: "wrap"
    }}>
                {[["piezas", "Las piezas"], ["especiales", "Jugadas especiales"], ["final", "Jaque y final"]].map(([id, label]) => <button key={id} onClick={() => setTab(id)} style={{
        ...btn(tab === id ? T.amber : "transparent", tab === id ? T.ink : T.cream, tab === id ? T.amber : T.line)
      }}>{label}</button>)}
            </div>

            {tab === "piezas" && <>
                    <Lesson title="El objetivo">
                        Das <b>jaque mate</b> cuando atacas al rey rival y no tiene forma de escapar.
                        Ese es el fin de la partida: no se captura al rey, se le acorrala. Las blancas siempre mueven primero.
                    </Lesson>
                    {["p", "n", "b", "r", "q", "k"].map(t => <Lesson key={t} title={PIECE_INFO[t][0]} demo={moveDemo(t)}>
                            {PIECE_INFO[t][1]}
                        </Lesson>)}
                </>}

            {tab === "especiales" && <>
                    <Lesson title="Enroque" demo={castleDemo}>
                        Rey y torre se mueven a la vez para poner al rey a salvo. El rey avanza dos casillas hacia
                        la torre y la torre salta a su lado. Solo si ninguno se ha movido, no hay piezas en medio
                        y el rey no pasa por jaque.
                    </Lesson>
                    <Lesson title="Captura al paso" demo={epDemo}>
                        Si un peón rival avanza dos casillas y queda justo al lado del tuyo, puedes capturarlo
                        "al paso" como si solo hubiera avanzado una. Solo en la jugada inmediatamente siguiente.
                    </Lesson>
                    <Lesson title="Coronación" demo={promoDemo}>
                        Cuando un peón llega a la última fila, se transforma en la pieza que elijas: casi siempre
                        una dama. Puedes tener varias damas a la vez.
                    </Lesson>
                </>}

            {tab === "final" && <>
                    <Lesson title="Jaque">
                        Cuando una pieza amenaza al rey, está en <b>jaque</b>. Estás obligado a responder: mover el
                        rey, bloquear la amenaza o capturar a quien ataca.
                    </Lesson>
                    <Lesson title="Jaque mate">
                        Si estás en jaque y no hay ninguna jugada legal que lo evite, es <b>jaque mate</b> y la
                        partida termina. Quien da el mate gana.
                    </Lesson>
                    <Lesson title="Tablas (empate)">
                        La partida es tablas si: hay <b>rey ahogado</b> (no estás en jaque pero no tienes jugadas
                        legales), se repite tres veces la misma posición, pasan 50 jugadas sin capturas ni peones,
                        o no queda material suficiente para dar mate.
                    </Lesson>
                </>}
        </div>;
}
