import React, { useState } from "react";

const START = [
  ["br", "bn", "bb", "bq", "bk", "bb", "bn", "br"],
  ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
  ["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"],
];

const GLYPH = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };

function makeStartBoard() {
  return START.map((row) =>
    row.map((item) => (item ? { type: item[1], color: item[0] } : null))
  );
}

function inBounds(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function cloneBoard(board) {
  return board.map((row) => row.map((piece) => (piece ? { ...piece } : null)));
}

function pieceMoves(board, r, c) {
  const piece = board[r][c];
  if (!piece) return [];

  const moves = [];
  const add = (nr, nc) => {
    if (!inBounds(nr, nc)) return;
    const target = board[nr][nc];
    if (!target || target.color !== piece.color) {
      moves.push({ from: [r, c], to: [nr, nc], captured: target ? target.type : null });
    }
  };

  if (piece.type === "p") {
    const dir = piece.color === "w" ? -1 : 1;
    const forward = r + dir;
    if (inBounds(forward, c) && !board[forward][c]) add(forward, c);
    for (const dc of [-1, 1]) {
      const nr = forward;
      const nc = c + dc;
      if (inBounds(nr, nc)) {
        const target = board[nr][nc];
        if (target && target.color !== piece.color) add(nr, nc);
      }
    }
    return moves;
  }

  const DIRS = {
    n: [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]],
    b: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
    r: [[-1, 0], [1, 0], [0, -1], [0, 1]],
    q: [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]],
    k: [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]],
  };

  if (piece.type === "n" || piece.type === "k") {
    for (const [dr, dc] of DIRS[piece.type]) {
      add(r + dr, c + dc);
    }
    return moves;
  }

  for (const [dr, dc] of DIRS[piece.type] || []) {
    let nr = r + dr;
    let nc = c + dc;
    while (inBounds(nr, nc)) {
      const target = board[nr][nc];
      if (!target) {
        add(nr, nc);
      } else {
        if (target.color !== piece.color) add(nr, nc);
        break;
      }
      nr += dr;
      nc += dc;
    }
  }

  return moves;
}

function applyMove(board, move) {
  const nextBoard = cloneBoard(board);
  const [fr, fc] = move.from;
  const [tr, tc] = move.to;
  nextBoard[tr][tc] = nextBoard[fr][fc];
  nextBoard[fr][fc] = null;
  return nextBoard;
}

export default function Chessmachine() {
  const [board, setBoard] = useState(makeStartBoard());
  const [selected, setSelected] = useState(null);
  const [legal, setLegal] = useState([]);
  const [turn, setTurn] = useState("w");

  const onSquare = (r, c) => {
    const piece = board[r][c];
    if (selected) {
      const move = legal.find((m) => m.to[0] === r && m.to[1] === c);
      if (move) {
        setBoard(applyMove(board, move));
        setSelected(null);
        setLegal([]);
        setTurn(turn === "w" ? "b" : "w");
        return;
      }
    }

    if (piece && piece.color === turn) {
      setSelected([r, c]);
      setLegal(pieceMoves(board, r, c));
    } else {
      setSelected(null);
      setLegal([]);
    }
  };

  const isLegalTarget = (r, c) => legal.some((m) => m.to[0] === r && m.to[1] === c);

  return (
    <div style={{ padding: 24, minHeight: "100vh", background: "#14171c", color: "#e7e2d6", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h1 style={{ margin: 0, fontSize: 30 }}>Ajedrez</h1>
          <button
            type="button"
            onClick={() => {
              setBoard(makeStartBoard());
              setSelected(null);
              setLegal([]);
              setTurn("w");
            }}
            style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #2c333d", background: "#23262b", color: "#e7e2d6", cursor: "pointer" }}
          >
            Nuevo juego
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(8, minmax(44px, 56px))", gap: 1, background: "#2c333d", borderRadius: 8, overflow: "hidden" }}>
          {board.map((row, r) =>
            row.map((piece, c) => {
              const dark = (r + c) % 2 === 1;
              const target = isLegalTarget(r, c);
              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => onSquare(r, c)}
                  style={{
                    width: 56,
                    height: 56,
                    background: target ? "#e0a23a" : dark ? "#9c6f47" : "#ecd9b0",
                    color: piece && piece.color === "w" ? "#fcfaf4" : "#23262b",
                    fontSize: 24,
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  {piece ? GLYPH[piece.type] : null}
                  {selected && selected[0] === r && selected[1] === c && (
                    <span style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 0 2px #e0a23a" }} />
                  )}
                </button>
              );
            })
          )}
        </div>
        <div style={{ marginTop: 18, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div>Turno: {turn === "w" ? "Blancas" : "Negras"}</div>
          <div>Seleccionado: {selected ? `${String.fromCharCode(97 + selected[1])}${8 - selected[0]}` : "ninguno"}</div>
          <div>Movimientos: {legal.length}</div>
        </div>
      </div>
    </div>
  );
}
