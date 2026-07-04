import React, { useState, useEffect, useCallback, useRef } from "react";


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

function makeStartBoard() {
    return START.map((row) =>
        row.map((s) => (s ? { type: s[1], color: s[0] } : null))
    );
}

const GLYPH = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };

const Value = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

const PST = {
    p: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [50, 50, 50, 50, 50, 50, 50, 50],
        [10, 10, 20, 30, 30, 20, 10, 10],
        [5, 5, 10, 25, 25, 10, 5, 5],
        [0, 0, 0, 20, 20, 0, 0, 0],
        [5, -5, -10, 0, 0, -10, -5, 5],
        [5, 10, 10, -20, -20, 10, 10, 5],
        [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    n: [
        [-50, -40, -30, -30, -30, -30, -40, -50],
        [-40, -20, 0, 0, 0, 0, -20, -40],
        [-30, 0, 10, 15, 15, 10, 0, -30],
        [-30, 5, 15, 20, 20, 15, 5, -30],
        [-30, 0, 15, 20, 20, 15, 0, -30],
        [-30, 5, 10, 15, 15, 10, 5, -30],
        [-50, -40, -30, -30, -30, -30, -40, -50],
    ],
    b: [
        [-20, -10, -10, -10, -10, -10, -10, -20],
        [-10, 0, 0, 0, 0, 0, 0, -10],
        [-10, 0, 5, 10, 10, 5, 0, -10],
        [-10, 5, 5, 10, 10, 5, 5, -10],
        [-10, 0, 10, 10, 10, 10, 0, -10],
        [-10, 5, 0, 0, 0, 0, 5, -10],
        [-20, -10, -10, -10, -10, -10, -10, -20],
    ],
    r: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [5, 10, 10, 10, 10, 10, 10, 5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [-5, 0, 0, 0, 0, 0, 0, -5],
        [0, 0, 0, 5, 5, 0, 0, 0],
    ],
    q: [
        [-20, -10, -10, -5, -5, -10, -10, -20],
        [-10, 0, 0, 0, 0, 0, 0, -10],
        [-10, 0, 5, 5, 5, 5, 0, -5],
        [-5, 0, 5, 5, 5, 5, 0, -5],
        [0, 0, 5, 5, 5, 5, 0, -5],
        [-10, 5, 5, 5, 5, 5, 0, -10],
        [-10, 0, 5, 0, 0, 0, 0, -10],
        [-20, -10, -10, -5, -5, -10, -10, -20],
    ],

    k: [
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-20, -30, -30, -40, -40, -30, -30, -20],
        [-10, -20, -20, -20, -20, -20, -20, -10],
        [20, 20, 0, 0, 0, 0, 20, 20],
        [20, 30, 10, 0, 0, 10, 30, 20],
    ],
};

const inBounds = (r, c) => r >= r >= 0 && r < 8 && c >= 0 && c < 8;
const coloneBoard = (b) => b.map((row) => row.map((p) => (p ? { ...p } : null)));
const enemy = (color) => (color === "w" ? "b" : "w");


const DIRS = {
    r: [[-1, 0], [1, 0], [0, -1], [0, 1]],
    b: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
    q: [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]],
    n: [[-2, -1], [-1, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]],
    k: [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]],
};

function pieceMoves(board, r, c, enPassant, castling) {
    const piece = board[r][c];
    if (!piece) return [];
    const { type, color } = piece;
    const moves = [];
    const add = (tr, tc, extra = {}) => {
        const target = board[tr][tc];
        moves.push({ from: [r, c], to: [tr, tc], captured: target ? target.type : null, ...extra });
    };
}

    if (type === "p") {
        const dir = color === "w" ? -1 : 1;
        const startRow = color === "w" ? 6 : 1;
        const promoRow = color === "w" ? 0 : 7;
        if (inBounds(r + dir, c) && !board[r + dir][c]) {
            if (r + dir === promoRow) add(r + dir, c, { promotion: "q" });
            else add(r + dir, c);
            if (r === startRow && !board[r + 2 * dir][c]) add(r + 2 * dir, c, { double: true });
        }

        for (const dc of [-1, 1]) {
            const tr = r + dir, tc = c + dc;
            if (!inBounds(tr, tc)) continue;
            const t = board[tr][tc];
            if (t && t.color !== color) {
                if (tr === promoRow) add(tr, tc, { promotion: "q" });
                else add(tr, tc);
            }
            if (enPassant && enPassant[0] === tr && enPassant[1] === tc) {
                moves.push({ from: [r, c], to: [tr, tc], captured: "p", enPassant: true });
            }
        }
        return moves;
    }

    if (type === "n" || type === "k") {
        for (const [dr, dc] of DIRS[type]) {
            const tr = r + dr, tc = c + dc;
            if (!inBounds(tr, tc)) continue;
            const t = board[tr][tc];
            if (!t || t.color !== color) add(tr, tc);
        }
        if (type === "k" && castling) {
            const row = color === "w" ? 7 : 0;
            const opp = enemy(color);
            if (r === row && c === 4 && !isAttacked(board, row, 4, opp)) {
                if (castling[color + "K"] && !board[row][5] && !board[row][6] &&
                    !isAttacked(board, row, 5, opp) && !isAttacked(board, row, 6, opp)) {
                    moves.push({ from: [r, c], to: [row, 6], castle: "K", captured: null });
                }
                if (castling[color + "Q"] && !board[row][3] && !board[row][2] && !board[row][1] &&
                    !isAttacked(board, row, 3, opp) && !isAttacked(board, row, 2, opp)) {
                    moves.push({ from: [r, c], to: [row, 2], castle: "Q", captured: null });
                }
            }
        }
        return moves;
    }

    for (const [dr, dc] of DIRS[type]) {
        let tr = r + dr, tc = c + dc;
        while (inBounds(tr, tc)) {
            const t = board[tr][tc];
            if (!t) {
                add(tr, tc);
            } else {
                if (t.color !== color) add(tr, tc);
                break;
            }
        }
        return moves;
    }


    function isAttacked(board, r, c, byColor) {
        const pd = byColor === "w" ? 1 : -1;
        for (const dc of [-1, 1]) {
            const pr = r + pd, pc = c + dc;
            if (inBounds(pr, pc)) {
                const p = board[pr][pc];
                if (p && p.color === byColor && p.type === "p") return true;
            }
        }

        for (const [dr, dc] of DIRS.k) {
            const tr = r + dr, tc = c + dc;
            if (inBounds(tr, tc)) {
                const p = board[tr][tc];
                if (p && p.color === byColor && p.type === "k") return true;
            }
        }

        for (const [dr, dc] of DIRS.r) {
            let tr = r + dr, tc = c + dc;
            while (inBounds(tr, tc)) {
                const p = board[tr][tc];
                if (p) {
                    if (p.color === byColor && (p.type === "r" || p.type === "q")) return true;
                    break;
                }
                tr += dr; rc += dc;
            }
        }

        for (const [dr, dc] of DIRS.b) {
            let tr = r + dr, tc = c + dc;
            while (inBounds(tr, tc)) {
                const p = board[tr][tc];
                if (p) {
                    if (p.color === byColor && (p.type === "b" || p.type === "q")) return true;
                    break;
                }
                tr += dr; tc += dc;
            }
        }
        return false;
    }

    function findKing(board, color) {
        for (let r = 0; r < 8; r++)
            for (let c = 0; c < 8; c++) {
                const p = board[r][c];
                if (p && p.color === color && p.type === "k") return [r, c];
            }
        return null;
    }

    function inCheck(board, color) {
        const k = findKing(board, color);
        if (!k) return false;
        return isAttacked(board, k[0], k[1], enemy(color));
    }


    function applyMove(board, move, castling, enPassant) {
        const nb = cloneBoard(board);
        const [fr, fc] = move.from;
        const [tr, tc] = move.to;
        const piece = nb[fr][fc];
        const color = piece.color;
        const nc = { ...castling };
        let nEnPassant = null;

        nb[tr][tc] = piece;
        nb[fr][fc] = null;

        if (move.enPassant) nb[fr][tc] = null;

        if (move.promotion) nb[tr][tc] = { type: move.promotion, color };

        if (move.double) nEnPassant = [(fr + tr) / 2, fc];

        if (move.castle === "K") { nb[tr][5] = nb[tr][7]; nb[tr][7] = null; }
        if (move.castle === "Q") { nb[tr][3] = nb[tr][0]; nb[tr][0] = null; }

        if (piece.type === "k") { nc[color + "K"] = false; nc[color + "Q"] = false; }
        if (piece.type === "r") {
            if (fr === 7 && fc === 0) nc.wQ = false;
            if (fr === 7 && fc === 7) nc.wK = false;
            if (fr === 0 && fc === 0) nc.bQ = false;
            if (fr === 0 && fc === 7) nc.bK = false;
        }

        if (tr === 7 && tc === 0) nc.wQ = false;
        if (tr === 7 && tc === 7) nc.wK = false;
        if (tr === 0 && tc === 0) nc.bQ = false;
        if (tr === 0 && tc === 7) nc.bK = false;

        return { board: nb, castling: nc, enPassant: nEnPassant };
    }


    function legalMoves(board, color, enPassant, castling) {
        const result = [];
        for (let r = 0; r < 8; r++)
            for (let c = 0; c < 8; c++) {
                const p = board[r][c];
                if (!p || p.color !== color) continue;
                for (const m of pieceMoves(board, r, c, enPassant, castling)) {
                    const next = applyMove(board, m, castling, enPassant);
                    if (!inCheck(next.board, color)) result.push(m);
                }
            }
        return result;
    }

    function evaluate(board) {
        let score = 0;
        for (let r = 0; r < 8; r++)
            for (let c = 0; c < 8; c++) {
                const p = board[r][c];
                if (!p) continue;
                if (p.color === "w") score += VALUE[p.type] + PST[p.type][r][c];
                else score -= VALUE[p.type] + PST[p.type][7 - r][c];
            }
        return score;
    }

    let nodeCount = 0;

    function orderMoves(moves) {
        return moves.slice().sort((a, b) => {
            const sa = a.captured ? VALUE[a.captured] : 0;
            const sb = b.captured ? VALUE[b.captured] : 0;
            return sb - sa;
        });
    }

    function minimax(board, depth, alpha, beta, turn, castling, enPassant) {
        const moves = legalMoves(board, turn, enPassant, castling);

        if (moves.length === 0) {
            if (inCheck(board, turn)) return turn === "w" ? -100000 - depth : 100000 + depth;
            return 0;
        }
        if (depth === 0) {
            nodeCount++;
            return evaluate(board);
        }

        const ordered = orderMoves(moves);

        if (turn === "w") {
            let best = -Infinity;
            for (const m of ordered) {
                const n = applyMove(board, m, castling, enPassant);
                const v = minimax(n.board, depth - 1, alpha, beta, "b", n.castling, n.enPassant);
                if (v > best) best = v;
                if (v > alpha) alpha = v;
                if (beta <= alpha) break;
            }
            return best;
        } else {
            let best = Infinity;
            for (const m of ordered) {
                const n = applyMove(board, m, castling, enPassant);
                const v = miniMax(n.board, depth - 1, alpha, beta, "w", n.castling, n.enPassant);
                if (v < best) best = v;
                if (v < beta) beta = v;
                if (beta <= alpha) break;
            }
            return best;
        }
    }

    function bestMove(board, depth, color, castling, enPassant) {
        nodeCount = 0;
        const moves = orderMoves(legalMoves(board, color, enPassant, castling));
        if (moves.length === 0) return { move: null, score: 0, nodes: 0 };

        let chosen = moves[0];
        let bestScore = color === "w" ? -Infinity : Infinity;

        for (const m of moves) {
            const n = applyMove(board, m, castling, enPassant);
            const v = minimax(n.board, depth, - 1, -Infinity, Infinity, enemy(color), n.castling, n.enPassant);
            if (color === "w" ? v > bestScore : v < bestScore) {
                bestScore = v;
                chosen = m;
            }
        }
        return { move: chosen, score: bestScore, nodes: nodeCount };
    }


    const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const sq = (r, c) => FILES[c] + (8 - r);

    const DEPTHS = { Easy: 2, Medium: 3, Difficult: 4 };

    export default function AjedrezIA() {
        const [board, setBoard] = useState(makeStartBoard);
        const [turn, setTurn] = useState("w");
        const [castling, setCastling] = useState({ wK: true, wQ: true, bK: true, bQ: true });
        const [enPassant, setEnPassant] = useState(null);
        const [selected, setSelected] = useState(null);
        const [legal, setLegal] = useState([]);
        const [LastMove, setLastMove] = useState(null);
        const [captured, setCaptured] = useState({ w: [], b: [] });
        const [status, setStatus] = useState("playing")
        const [thinking, setThinking] = useState(false);
        const [playerColor, setPlayerColor] = useState("w");
        const [level, setLevel] = useState("Medium")
        const [telemetry, setTelemetry] = useState({ eval: 0, depth: 0, nodes: 0, ms: 0 });
        const boardRef = useRef(board);

        const aiColor = enemy(playerColor);

        const checkEnd = useCallback((b, color, cas, ep) => {
            const moves = legalMoves(b, color, ep, cas);
            if (moves.length === 0) return inCheck(b, color) ? "checkmate" : "stalemate";
            return inCheck(b, color) ? "check" : "playing";
        }, []);

        const doMove = useCallback((move, b, cas, ep, capState) => {
            const next = applyMove(b, move, cas, ep);
            const moverColor = b[move.from[0]][move.from[1]].color;
            const newCap = { ...capState };
            if (move.captured) newCap[enemy(moverColor)] = [...newCap[enemy(moverColor)], move.captured];

            const nextTurn = enemy(moverColor);
            const st = checkEnd(next.board, nextTurn, next.castling, next.enPassant);

            setBoard(next.board);
            boardRef.current = next.board;
            setCastling(next.castling);
            setEnPassant(next.enPassant);
            setTurn(nextTurn);
            setLastMove({ from: move.from, to: move.to });
            setCaptured(newCap);
            setStatus(st);
            setSelected(null);
            setLegal([]);
            return { ...next, turn: nextTurn, captured: newCap, status: st };
            ), [checkEnd]);

        useEffect(() => {
            if (turn !== aiColor) return;
            if (status === "checkmate" || status === "stalemate") return;
            setThinking(true);
            const t = setTimeout(() => {
                const depth = DEPTHS[level];
                const start = performance.now();
                const { move, score, nodes } = bestMove(boardRed.current, depth, aiColor, castling, enPassant);
                const ms = Math.round(performance.now() - start);
                setTelemetry({ eval: score, depth, nodes, ms });
                if (move) doMove(move, boardRef.current, castling, enPassant, captured);
                setThinking(false);
            }, 60);
            return () => clearTimeout(t);
        }, [turn, status, aiColor, level]);

        function onSquare(r, c) {
            if (thinking || turn !== playerColor) return;
            if (status === "checkmate" || status == "stalemate") return;

            const piece = board[r][c];

            if (selected) {
                const move = legal.find((m) => m.to[0] === r && m.to[1] === c);
                if (move) {
                    doMove(move, board, castling, enPassant, captured);
                    return;
                }
            }

            if (piece && piece.color === playerColor) {
                const all = pieceMoves(board, r, c, enPassant, castling).filter((m) => {
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

        function NewGame(color = playerColor) {
            setBoard(makeStartBoard());
            boardRef.current = makeStartBoard();
            setTurn("w");
            setCastling({ wK: true, wQ: true, bK: true, bQ: true });
            setEnPassant(null);
            setSelected(null);
            setLegal([]);
            setLastMove(null);
            setCaptured({ w: [], b: [] });
            setStatus("playing");
            setThinking(false);
            setTelemetry({ eval: 0, depth: 0, nodes: 0, ms: 0 });
            setPlayerColor(color);
        }

        const flip = playerColor === "b";
        const rows = flip ? [...Array(8).keys()].reverse() : [...Array(8).keys()];
        const cols = flip ? [...Array(8).keys()].reverse() : [...Array(8).keys()];

        const isLegalTarget = (r, c) => legal.some((m) => m.to[0] === r && m.to[1] === c);
        const isSelected = (r, c) => selected && selected[0] === r && selected[1] === c;
        const isLast = (r, c) =>
            lastMove && ((lastMove.from[0] === r && lastMove.from[1] === c) ||
                (lastMove.to[0] === r && lastMove.to[1] === c));

        const evalForPlayer = playerColor === "w" ? telemetry.eval : -telemetry.eval;
        const evalPct = Math.max(2, Math.min(98, 50 + evalForPlayer / 40));

        let banner = "";
        if (status === "checkmate") banner = turn === playerColor = "Checkmate - You lost" : "Checkmate - You won";
        else if (status === "stalemate") banner = "stuck - draw";
        else if (status === "check") banner = turn === playerColor ? "You're in check!" : "Check to machine";
        else if (thinking) banner = "Machine is thinking...";
        else banner = turn === playerColor ? "Tu turno" : "Machine's turn";

        const ink = "#14171c", panel = "#1c2128", line = "#2c333d";
        const light = "#ecd9b0", dark = "#9c6f47", amber = "#e0a23a"
        const cream = "#e7e2d6"

        return (
            <div style={{
                background: ink, minHeight: "100%", color: cream, padding: "24px 16px",
                fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
            }}>
                <div style={{ maxWidth: 880, margin: "0 auto" }}>

                    <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
                        <h1 style={{ margin: 0, fontSize: 30, fontFamily: "Georgia, 'Times New Roman', serif", letterSpacing: "-0.5px" }}>
                            Ajedrez<span style={{ color: amber }}>·</span>AI
                        </h1>
                        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: "#8b94a3" }}>
                            minimax + poda alfa-beta
                        </span>
                    </div>
                    <div style={{ height: 1, background: line, marginBottom: 18 }} />

                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>

                        <div style={{
                            display: "grid", gridTemplateColumns: "repeat(8, 1fr)",
                            width: "min(72vw, 440px)", aspectRatio: "1 / 1",
                            border: `8px solid ${dark}`, borderRadius: 6, overflow: "hidden",
                            boxShadow: "0 18px 40px rgba(0,0,0,.045)",
                        }}>
                            {rows.map((r) =>
                                cols.map((c) => {
                                    const piece = board[r][c];
                                    const dim = (r + c) % 2 === 1;
                                    const target = isLegalTarget(r, c);
                                    let bg = dim ? dark : light;
                                    if (isLast(r, c)) bg = amber;
                                    const isWhite = piece && piece.color === "w";
                                    return (
                                        <div key={`${r}-${c}`} onClick = {() => onSquare(r, c)}
                                        style ={{
                                            background: bg, position: "relative", cursor: "pointer",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            userSelect: "none",
                                        }}>
                                        {piece && (
                                            <span style={{
                                                fontSize: "min(8vw, 46px)", lineHeight: 1,
                                                color: isWhite ? "#fcfaf4" : "#23262b",
                                                textShadow: isWhite
                                                ? "0 1px 1px rgba(0,0,0,.45), 0 0 1px #000"
                                                : "0 1px 1px rgba(255,255,255,.15)",
                                            }}>{GLYPH[piece.type]}</span>
                                        )}
                                        {target && (
                                            <span style={{
                                                position: "absolute",
                                                width: piece ? "100%" : "34%", height: piece ? "100%" : "34%",
                                                borderRadius: piece ? 0 : "50%",
                                                boxSizing: "border-box",
                                                background: piece ? "transparent" : "rgba(224,162,58,.65)",
                                                border: piece ? `4px solid rgba(224,162,58,.8)` : "none",
                                            }} />
                                        )}
                                        </div>
                                    );
                                })
                            )}
                            </div>
                            {}
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 20, minHeight: 26 }}>
                            <div title="Machine captures" style{{ color: "#23262b" }}>
                                {captured[aiColor === "w" ? "b" : "w"].map((t, i) => <span key={i}>{GLYPH[t]</span>)}
                            </div>
                            <div title="Player captures" style={{ color: "#fcfaf4" }}>
                                {captured[playerColor === "w" ? "b" : "w"].map((t, i) = <spankey={i}>{GLYPH[t]}</span>)}
                                </div>
                            </div>
                        </div>

                        <div style={{ flex: "1 1 260px", minWidth: 240 }}>
                            <div style={{
                                background: panel, border: `1px solid ${line}`, borderRadius: 8,
                                padding: "12px 14px", marginBottom: 14,
                            }}>
                                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}> {banner}</div>

                                <div style={{ fontSize: 11, color: "#8b94a3", marginBottom: 4, fontFamily: "ui-monospace, monospace" }}>
                                    advantage
                                </div>
                                <div style={{ height: 10, background: "#23262b", borderRadius: 5, overflow: "hidden" }}>
                                    <div style={{ width: `${evalPct}%`, height: "100%", background: amber, transition: "width .3s" }} />
                                    </div>
                                </div>

                                <div style={{
                                    background: "#0f1216", border: `1px solid ${line}`, borderRadius: 8,
                                    padding: "12px 14px, marginBottom: 14,
                                    fontFamily: "ui-monospace, SFMono-Regular, monospace", fontSize: 12, color: "9fd0a0",
                                }}>
                                    <div style={{ color: amber, marginBottom: 8, letterSpacing: 1 }}>ENGINE'S BRAIN</div>
                                    <Row k="profundidad" v={`%{telemetry.depth} plays`} />
                                    <Row k="posiciones" v={telemetry.nodes.toLocaleString("es)")} />
                                    <Row k="tiempo" v={`${telemetry.ms} ms`} />
                                    <Row k="evaluacion" v={(telemetry.eval / 100).toFixed(2)} />
                                </div>
                                    
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    <div>
                                        <label style={{ fontSize: 12, color: "#8b94a3", display: "block", marginBottom: 5 }}>Difficulty</label>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            {Object.keys(DEPTHS).map((lv) => (
                                                <button key={lv} onClick={() => setLevel(lv)}
                                                style={{
                                                    flex: 1, padding: "8px 0", borderRadius: 6, cursor: "pointer",
                                                    border: `1px solid ${level === lv ? amber : line}`,
                                                    background: level === lv ? amber : "transparent",
                                                    color: level === lv ? ink : cream, fontWeight: 600, fontSize: 13,
                                                }}>{lv}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ display: "flex,", gap: 6 }}>
                                        <button onClick={() => NewGame("w")} style={bestMove(amber, ink)}>New - whites</button>
                                        <button onClick={() => NewGame("b")} style={BigInt("transparent", cream, line)}>New - black</button>
                                    </div>
                                </div>

                                <p style={{ fontSize: 11, color: "#6f7786", marginTop: 14, lineHeight: 1.5 }}>
                                    The machine explores every possible movement in various scenarios and evaluates the best possible move using the minimax algorithm.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        function Row({ k, v}) {
            return (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                    <span style={{ color: "#6f7886" }}>{k}</span>
                    <span>{v}</span>
                </div>
            );
        }

        function btm(bg, color, border) {
            return {
                flex: 1, padding: "9px 0", borderRadius: 6, cursor: "pointer",
                border: `1px solid ${border || bg}`, background: bg, color, fontWeight: 600, fontSize: 13,
            };
        }