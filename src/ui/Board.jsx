import React from "react";
import { Piece } from "./Pieces.jsx";
import { T } from "./theme.js";
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
export default function Board({
  board,
  flip,
  selected,
  legal,
  lastMove,
  checkSq,
  anim,
  onSquare,
  maxWidth = 560
}) {
  const rows = flip ? [...Array(8).keys()].reverse() : [...Array(8).keys()];
  const cols = flip ? [...Array(8).keys()].reverse() : [...Array(8).keys()];
  const isLegalTarget = (r, c) => legal.some(m => m.to[0] === r && m.to[1] === c);
  const isSelected = (r, c) => selected && selected[0] === r && selected[1] === c;
  const isLast = (r, c) => lastMove && (lastMove.from[0] === r && lastMove.from[1] === c || lastMove.to[0] === r && lastMove.to[1] === c);
  const isCheckSq = (r, c) => checkSq && checkSq[0] === r && checkSq[1] === c;
  const firstCol = cols[0];
  const lastRow = rows[rows.length - 1];
  return <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(8, 1fr)",
    gridTemplateRows: "repeat(8, 1fr)",
    width: `min(92vw, ${maxWidth}px)`,
    aspectRatio: "1 / 1",
    border: `8px solid ${T.dark}`,
    borderRadius: 6,
    overflow: "hidden",
    boxShadow: "0 18px 40px rgba(0,0,0,.45)"
  }}>
            {rows.map(r => cols.map(c => {
      const piece = board[r][c];
      const dim = (r + c) % 2 === 1;
      const target = isLegalTarget(r, c);
      let bg = dim ? T.dark : T.light;
      if (isSelected(r, c)) bg = T.sel;
      if (isLast(r, c)) bg = T.amber;
      if (isCheckSq(r, c)) bg = T.danger;
      const labelColor = dim ? T.light : T.dark;
      const showRank = c === firstCol;
      const showFile = r === lastRow;
      const isTarget = anim && anim.toR === r && anim.toC === c;
      let tx = 0,
        ty = 0;
      if (isTarget && !anim.settled) {
        const vFromR = flip ? 7 - anim.fromR : anim.fromR;
        const vFromC = flip ? 7 - anim.fromC : anim.fromC;
        const vToR = flip ? 7 - anim.toR : anim.toR;
        const vToC = flip ? 7 - anim.toC : anim.toC;
        tx = vFromC - vToC;
        ty = vFromR - vToR;
      }
      return <div key={`${r}-${c}`} onClick={() => onSquare(r, c)} style={{
        background: bg,
        position: "relative",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none"
      }}>
                            {showRank && <span style={{
          position: "absolute",
          top: 1,
          left: 2,
          fontSize: "clamp(7px, 1.6vw, 11px)",
          fontWeight: 700,
          color: labelColor,
          opacity: 0.9,
          pointerEvents: "none",
          lineHeight: 1
        }}>{8 - r}</span>}
                            {showFile && <span style={{
          position: "absolute",
          bottom: 1,
          right: 3,
          fontSize: "clamp(7px, 1.6vw, 11px)",
          fontWeight: 700,
          color: labelColor,
          opacity: 0.9,
          pointerEvents: "none",
          lineHeight: 1
        }}>{FILES[c]}</span>}
                            {piece && <div key={isTarget ? `mv-${anim.key}` : "st"} style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `translate(${tx * 100}%, ${ty * 100}%)`,
          transition: isTarget ? "transform .22s ease" : "none",
          zIndex: isTarget ? 5 : 1
        }}>
                                    <Piece type={piece.type} color={piece.color} size="80%" />
                                </div>}
                            {target && <span style={{
          position: "absolute",
          width: piece ? "100%" : "34%",
          height: piece ? "100%" : "34%",
          borderRadius: piece ? 0 : "50%",
          boxSizing: "border-box",
          background: piece ? "transparent" : "rgba(224,162,58,.65)",
          border: piece ? `4px solid rgba(224,162,58,.8)` : "none",
          zIndex: 3
        }} />}
                        </div>;
    }))}
        </div>;
}
