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
        [-40, -20, 0, 5, 5, 0, -20, -40],
        [-50, -40, -30, -30, -30, -30, -40, -50],
    ],
    b: [
        [-20, -10, -10, -10, -10, -10, -10, -20],
        [-10, 0, 0, 0, 0, 0, 0, -10],
        [-10, 0, 5, 10, 10, 5, 0, -10],
        [-10, 5, 5, 10, 10, 5, 5, -10],
        [-10, 0, 10, 10, 10, 10, 0, -10],
        [-10, 10, 10, 10, 10, 10, 10, -10],
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

const inBounds = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
const cloneBoard = (b) => b.map((row) => row.map((p) => (p ? { ...p } : null)));
const enemy = (color) => (color === "w" ? "b" : "w");


const DIRS = {
    r: [[-1, 0], [1, 0], [0, -1], [0, 1]],
    b: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
    q: [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]],
    n: [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]],
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
            tr += dr; tc += dc;
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
                tr += dr; tc += dc;
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
                if (p.color === "w") score += Value[p.type] + PST[p.type][r][c];
                else score -= Value[p.type] + PST[p.type][7 - r][c];
            }
        return score;
    }

    let nodeCount = 0;

    function orderMoves(moves) {
        return moves.slice().sort((a, b) => {
            const sa = a.captured ? Value[a.captured] : 0;
            const sb = b.captured ? Value[b.captured] : 0;
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
                const v = minimax(n.board, depth - 1, alpha, beta, "w", n.castling, n.enPassant);
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

    const THINK_MS = { Easy: 3000, Medium: 3000, Difficult: 3000 };

    function PieceShape({ type, fill, stroke }) {
        const common = { fill, stroke, strokeWidth: 1.5, strokeLinejoin: "round" };
        switch (type) {
            case "p":
                return (
                    <g {...common}>
                        <path d="M22.5,9 C20,9 18,10.8 18,13 C18,14.6 18.8,16 20,16.9
                                 C17.3,18.4 15.4,21.2 15.4,24.4 C15.4,26.8 16.6,28.9 18.4,30.2
                                 C14.6,32 11,35.6 11,39.5 L34,39.5 C34,35.6 30.4,32 26.6,30.2
                                 C28.4,28.9 29.6,26.8 29.6,24.4 C29.6,21.2 27.7,18.4 25,16.9
                                 C26.2,16 27,14.6 27,13 C27,10.8 25,9 22.5,9 Z" />
                    </g>
                );
            case "r":
                return (
                    <g {...common} strokeLinecap="round">
                        <path d="M13,10 L13,14 L16.5,14 L16.5,11.5 L20.5,11.5 L20.5,14
                                 L24.5,14 L24.5,11.5 L28.5,11.5 L28.5,14 L32,14 L32,10 Z" />
                        <path d="M15.5,14 L29.5,14 L28,17.5 L17,17.5 Z" />
                        <path d="M17,17.5 L28,17.5 L28,29 L17,29 Z" />
                        <path d="M15,29 L30,29 L32.5,32.5 L12.5,32.5 Z" />
                        <path d="M11,32.5 L34,32.5 L34,36 L11,36 Z" />
                        <path d="M9.5,36 L35.5,36 L35.5,39.5 L9.5,39.5 Z" />
                    </g>
                );
            case "b":
                return (
                    <g {...common}>
                        <circle cx="22.5" cy="9" r="2.6" />
                        <path d="M22.5,11.5 C17,15 15.5,20 16.5,24.5 C17.2,27.6 19,29.5 22.5,30.5
                                 C26,29.5 27.8,27.6 28.5,24.5 C29.5,20 28,15 22.5,11.5 Z" />
                        <path d="M22.5,16 L22.5,24 M19,20.5 L26,20.5" strokeWidth="1.4" fill="none" />
                        <path d="M16,30.5 L29,30.5 L27.5,33.5 L17.5,33.5 Z" />
                        <path d="M13,33.5 L32,33.5 C31,36.5 26.5,37.5 22.5,37.5 C18.5,37.5 14,36.5 13,33.5 Z" />
                        <path d="M11.5,37.5 L33.5,37.5 L33.5,40 L11.5,40 Z" />
                    </g>
                );
            case "n":
                return (
                    <g {...common}>
                        <path d="M14,33 C14,27 16,24 18.5,21 C16.5,22 14.5,22.5 12.5,21.5
                                 C11,20.5 11.2,18.8 12.5,18 C12,16.5 12.5,14.5 14,13
                                 C14.5,11.5 15,10 16,9.5 C16.3,10.8 16.8,11.5 17.5,11.8
                                 C18.2,10.5 19.2,9.2 20.5,9 C25,9.2 29,12 31,17
                                 C33,22 33.5,28 33,33 Z" />
                        <path d="M12.5,32.5 L33,32.5 L34.5,36 L11,36 Z" />
                        <path d="M10,36 L35,36 L35,39.5 L10,39.5 Z" />
                        <circle cx="15.8" cy="14.8" r="1.1" fill={stroke} stroke="none" />
                        <path d="M13.2,18.5 C14.5,18 15.8,18.2 16.8,19" fill="none" strokeWidth="1.1" />
                    </g>
                );
            case "q":
                return (
                    <g {...common}>
                        <path d="M9,26 L9,14 L13,24 L16.5,12 L19.5,24 L22.5,11 L25.5,24 L28.5,12
                                 L32,24 L36,14 L36,26 Z" />
                        <circle cx="9" cy="14" r="2.2" />
                        <circle cx="16.5" cy="12" r="2.2" />
                        <circle cx="22.5" cy="11" r="2.2" />
                        <circle cx="28.5" cy="12" r="2.2" />
                        <circle cx="36" cy="14" r="2.2" />
                        <path d="M12,26 L33,26 L34.5,30 L10.5,30 Z" />
                        <path d="M10.5,30 L34.5,30 C33,34 27.5,35.5 22.5,35.5 C17.5,35.5 12,34 10.5,30 Z" />
                        <path d="M9.5,35.5 L35.5,35.5 L35.5,39.5 L9.5,39.5 Z" />
                    </g>
                );
            case "k":
                return (
                    <g {...common}>
                        <path d="M20.3,2.5 L24.7,2.5 L24.7,6 L28.2,6 L28.2,10.2 L24.7,10.2 L24.7,13.8
                                 L20.3,13.8 L20.3,10.2 L16.8,10.2 L16.8,6 L20.3,6 Z" />
                        <path d="M22.5,13.5 C17,13.5 13,17.5 13,22.5 C13,25.6 14.6,28.2 17.2,29.7
                                 C14.3,31.2 12,34 12,37 L33,37 C33,34 30.7,31.2 27.8,29.7
                                 C30.4,28.2 32,25.6 32,22.5 C32,17.5 28,13.5 22.5,13.5 Z" />
                        <path d="M16.5,29.7 L28.5,29.7" strokeWidth="1.3" fill="none" />
                        <path d="M10.5,37 L34.5,37 C33.3,39.6 27.5,40.5 22.5,40.5 C17.5,40.5 11.7,39.6 10.5,37 Z" />
                    </g>
                );
            default:
                return null;
        }
    }

    function Piece({ type, color, size = "82%" }) {
        const fill = color === "w" ? "#f7f4ec" : "#2b2f36";
        const stroke = color === "w" ? "#2b2f36" : "#cfd3da";
        return (
            <svg viewBox="0 0 45 45" width={size} height={size}
                style={{ display: "block", overflow: "visible", filter: "drop-shadow(0 1px 1px rgba(0,0,0,.35))" }}>
                <PieceShape type={type} fill={fill} stroke={stroke} />
            </svg>
        );
    }

    export default function AjedrezIA() {
        const [board, setBoard] = useState(makeStartBoard);
        const [turn, setTurn] = useState("w");
        const [castling, setCastling] = useState({ wK: true, wQ: true, bK: true, bQ: true });
        const [enPassant, setEnPassant] = useState(null);
        const [selected, setSelected] = useState(null);
        const [legal, setLegal] = useState([]);
        const [lastMove, setlastMove] = useState(null);
        const [captured, setCaptured] = useState({ w: [], b: [] });
        const [status, setStatus] = useState("playing");
        const [thinking, setThinking] = useState(false);
        const [playerColor, setPlayerColor] = useState("w");
        const [level, setLevel] = useState("Medium");
        const [telemetry, setTelemetry] = useState({ eval: 0, depth: 0, nodes: 0, ms: 0 });
        const [anim, setAnim] = useState(null);
        const [isFs, setIsFs] = useState(false);
        const boardRef = useRef(board);
        const rootRef = useRef(null);
        const animId = useRef(0);

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
            setlastMove({ from: move.from, to: move.to });
            setCaptured(newCap);
            setStatus(st);
            setSelected(null);
            setLegal([]);
            animId.current += 1;
            setAnim({
                key: animId.current, settled: false,
                fromR: move.from[0], fromC: move.from[1],
                toR: move.to[0], toC: move.to[1],
            });
            return { ...next, turn: nextTurn, captured: newCap, status: st };
        }, [checkEnd]);

        useEffect(() => {
            if (!anim || anim.settled) return;
            let id2;
            const id1 = requestAnimationFrame(() => {
                id2 = requestAnimationFrame(() => {
                    setAnim((a) => (a && a.key === anim.key ? { ...a, settled: true } : a));
                });
            });
            return () => { cancelAnimationFrame(id1); if (id2) cancelAnimationFrame(id2); };
        }, [anim ? anim.key : null]);

        useEffect(() => {
            const h = () => setIsFs(!!document.fullscreenElement);
            document.addEventListener("fullscreenchange", h);
            return () => document.removeEventListener("fullscreenchange", h);
        }, []);

        function toggleFullscreen() {
            const el = rootRef.current;
            if (!document.fullscreenElement) {
                if (el && el.requestFullscreen) el.requestFullscreen();
            } else if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }

        useEffect(() => {
            if (turn !== aiColor) return;
            if (status === "checkmate" || status === "stalemate") return;
            setThinking(true);
            let moveTimer;
            const calcTimer = setTimeout(() => {
                const depth = DEPTHS[level];
                const start = performance.now();
                const { move, score, nodes } = bestMove(boardRef.current, depth, aiColor, castling, enPassant);
                const ms = Math.round(performance.now() - start);
                setTelemetry({ eval: score, depth, nodes, ms });
                const wait = Math.max(0, THINK_MS[level] - ms);
                moveTimer = setTimeout(() => {
                    if (move) doMove(move, boardRef.current, castling, enPassant, captured);
                    setThinking(false);
                }, wait);
            }, 60);
            return () => { clearTimeout(calcTimer); clearTimeout(moveTimer); };
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
            setlastMove(null);
            setCaptured({ w: [], b: [] });
            setStatus("playing");
            setThinking(false);
            setTelemetry({ eval: 0, depth: 0, nodes: 0, ms: 0 });
            setAnim(null);
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
        if (status === "checkmate") banner = turn === playerColor ? "Jaque mate - Has perdido" : "Jaque mate - Has ganado";
        else if (status === "stalemate") banner = "Tablas - ahogado";
        else if (status === "check") banner = turn === playerColor ? "¡Estás en jaque!" : "Jaque a la máquina";
        else if (thinking) banner = "La máquina está pensando...";
        else banner = turn === playerColor ? "Tu turno" : "Turno de la máquina";

        const ink = "#14171c", panel = "#1c2128", line = "#2c333d";
        const light = "#ecd9b0", dark = "#9c6f47", amber = "#e0a23a";
        const cream = "#e7e2d6", sel = "#d7b25b", danger = "#d1495b";

        const machKey = aiColor === "w" ? "b" : "w";
        const playKey = playerColor === "w" ? "b" : "w";

        const checkSq = status === "check" ? findKing(board, turn) : null;
        const isCheckSq = (r, c) => checkSq && checkSq[0] === r && checkSq[1] === c;

        const material = (arr) => arr.reduce((s, t) => s + Value[t], 0);
        const playerAdv = (material(captured[playKey]) - material(captured[machKey])) / 100;

        const firstCol = cols[0];
        const lastRow = rows[rows.length - 1];

        return (
            <div ref={rootRef} className="jq-app" style={{
                background: ink, minHeight: "100%", color: cream,
                fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
            }}>
                <div style={{ maxWidth: 1000, margin: "0 auto" }}>

                    <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4, flexWrap: "wrap" }}>
                        <h1 style={{ margin: 0, fontSize: "clamp(22px, 6vw, 30px)", fontFamily: "Georgia, 'Times New Roman', serif", letterSpacing: "-0.5px" }}>
                            Ajedrez<span style={{ color: amber }}>·</span>AI
                        </h1>
                        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: "#8b94a3" }}>
                            minimax + poda alfa-beta
                        </span>
                        <button onClick={toggleFullscreen} title="Pantalla completa" className="jq-btn"
                            style={{
                                marginLeft: "auto", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
                                padding: "9px 12px", minHeight: 40, borderRadius: 7, cursor: "pointer",
                                border: `1px solid ${line}`, background: panel, color: cream,
                                fontSize: 13, fontWeight: 600,
                            }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                {isFs ? (
                                    <path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" />
                                ) : (
                                    <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />
                                )}
                            </svg>
                            {isFs ? "Salir" : "Pantalla completa"}
                        </button>
                    </div>
                    <div style={{ height: 1, background: line, marginBottom: 18 }} />

                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>

                        <div>
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(8, 1fr)",
                                gridTemplateRows: "repeat(8, 1fr)",
                                width: "min(92vw, 560px)", aspectRatio: "1 / 1",
                                border: `8px solid ${dark}`, borderRadius: 6, overflow: "hidden",
                                boxShadow: "0 18px 40px rgba(0,0,0,.45)",
                            }}>
                                {rows.map((r) =>
                                    cols.map((c) => {
                                        const piece = board[r][c];
                                        const dim = (r + c) % 2 === 1;
                                        const target = isLegalTarget(r, c);
                                        let bg = dim ? dark : light;
                                        if (isSelected(r, c)) bg = sel;
                                        if (isLast(r, c)) bg = amber;
                                        if (isCheckSq(r, c)) bg = danger;

                                        const labelColor = dim ? light : dark;
                                        const showRank = c === firstCol;
                                        const showFile = r === lastRow;

                                        const isTarget = anim && anim.toR === r && anim.toC === c;
                                        let tx = 0, ty = 0;
                                        if (isTarget && !anim.settled) {
                                            const vFromR = flip ? 7 - anim.fromR : anim.fromR;
                                            const vFromC = flip ? 7 - anim.fromC : anim.fromC;
                                            const vToR = flip ? 7 - anim.toR : anim.toR;
                                            const vToC = flip ? 7 - anim.toC : anim.toC;
                                            tx = vFromC - vToC;
                                            ty = vFromR - vToR;
                                        }

                                        return (
                                            <div key={`${r}-${c}`} className="jq-square" onClick={() => onSquare(r, c)}
                                                style={{
                                                    background: bg, position: "relative", cursor: "pointer",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    userSelect: "none",
                                                }}>
                                                {showRank && (
                                                    <span style={{
                                                        position: "absolute", top: 1, left: 2,
                                                        fontSize: "clamp(7px, 1.6vw, 11px)", fontWeight: 700,
                                                        color: labelColor, opacity: 0.9, pointerEvents: "none", lineHeight: 1,
                                                    }}>{8 - r}</span>
                                                )}
                                                {showFile && (
                                                    <span style={{
                                                        position: "absolute", bottom: 1, right: 3,
                                                        fontSize: "clamp(7px, 1.6vw, 11px)", fontWeight: 700,
                                                        color: labelColor, opacity: 0.9, pointerEvents: "none", lineHeight: 1,
                                                    }}>{FILES[c]}</span>
                                                )}
                                                {piece && (
                                                    <div
                                                        key={isTarget ? `mv-${anim.key}` : "st"}
                                                        style={{
                                                            position: "absolute", inset: 0,
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                            transform: `translate(${tx * 100}%, ${ty * 100}%)`,
                                                            transition: isTarget ? "transform .22s ease" : "none",
                                                            zIndex: isTarget ? 5 : 1,
                                                        }}>
                                                        <Piece type={piece.type} color={piece.color} size="80%" />
                                                    </div>
                                                )}
                                                {target && (
                                                    <span style={{
                                                        position: "absolute",
                                                        width: piece ? "100%" : "34%", height: piece ? "100%" : "34%",
                                                        borderRadius: piece ? 0 : "50%",
                                                        boxSizing: "border-box",
                                                        background: piece ? "transparent" : "rgba(224,162,58,.65)",
                                                        border: piece ? `4px solid rgba(224,162,58,.8)` : "none",
                                                        zIndex: 3,
                                                    }} />
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, minHeight: 26, gap: 8 }}>
                                <div title="Capturas de la máquina" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
                                    {captured[machKey].map((t, i) => (
                                        <Piece key={i} type={t} color={machKey} size={22} />
                                    ))}
                                    {playerAdv < 0 && (
                                        <span style={{ marginLeft: 5, fontSize: 13, fontWeight: 700, color: "#8b94a3" }}>
                                            +{-playerAdv}
                                        </span>
                                    )}
                                </div>
                                <div title="Tus capturas" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
                                    {captured[playKey].map((t, i) => (
                                        <Piece key={i} type={t} color={playKey} size={22} />
                                    ))}
                                    {playerAdv > 0 && (
                                        <span style={{ marginLeft: 5, fontSize: 13, fontWeight: 700, color: "#9fd0a0" }}>
                                            +{playerAdv}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={{ flex: "1 1 260px", minWidth: 240 }}>
                            <div style={{
                                background: panel, border: `1px solid ${line}`, borderRadius: 8,
                                padding: "12px 14px", marginBottom: 14,
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
                                    <span className={thinking ? "jq-pulse" : undefined} style={{
                                        width: 9, height: 9, borderRadius: "50%", flexShrink: 0,
                                        background: status === "check" ? danger : (turn === playerColor ? "#7ec27e" : amber),
                                    }} />
                                    <span>{banner}</span>
                                </div>

                                <div style={{ fontSize: 11, color: "#8b94a3", marginBottom: 4, fontFamily: "ui-monospace, monospace" }}>
                                    ventaja
                                </div>
                                <div style={{ height: 10, background: "#23262b", borderRadius: 5, overflow: "hidden" }}>
                                    <div style={{ width: `${evalPct}%`, height: "100%", background: amber, transition: "width .3s" }} />
                                </div>
                            </div>

                            <div style={{
                                background: "#0f1216", border: `1px solid ${line}`, borderRadius: 8,
                                padding: "12px 14px", marginBottom: 14,
                                fontFamily: "ui-monospace, SFMono-Regular, monospace", fontSize: 12, color: "#9fd0a0",
                            }}>
                                <div style={{ color: amber, marginBottom: 8, letterSpacing: 1 }}>CEREBRO DEL MOTOR</div>
                                <Row k="profundidad" v={`${telemetry.depth} jugadas`} />
                                <Row k="posiciones" v={telemetry.nodes.toLocaleString("es")} />
                                <Row k="tiempo" v={`${telemetry.ms} ms`} />
                                <Row k="evaluación" v={(telemetry.eval / 100).toFixed(2)} />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                <div>
                                    <label style={{ fontSize: 12, color: "#8b94a3", display: "block", marginBottom: 5 }}>Dificultad</label>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        {Object.keys(DEPTHS).map((lv) => (
                                            <button key={lv} onClick={() => setLevel(lv)} className="jq-btn"
                                                style={{
                                                    flex: 1, padding: "10px 0", minHeight: 42, borderRadius: 6, cursor: "pointer",
                                                    border: `1px solid ${level === lv ? amber : line}`,
                                                    background: level === lv ? amber : "transparent",
                                                    color: level === lv ? ink : cream, fontWeight: 600, fontSize: 13,
                                                }}>{lv}</button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 6 }}>
                                    <button onClick={() => NewGame("w")} className="jq-btn" style={btm(amber, ink)}>Nueva - blancas</button>
                                    <button onClick={() => NewGame("b")} className="jq-btn" style={btm("transparent", cream, line)}>Nueva - negras</button>
                                </div>
                            </div>

                            <p style={{ fontSize: 11, color: "#6f7786", marginTop: 14, lineHeight: 1.5 }}>
                                La máquina explora todos los movimientos posibles en varios escenarios y elige la mejor jugada con el algoritmo minimax.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    function Row({ k, v }) {
        return (
            <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                <span style={{ color: "#6f7886" }}>{k}</span>
                <span>{v}</span>
            </div>
        );
    }

    function btm(bg, color, border) {
        return {
            flex: 1, padding: "11px 0", minHeight: 44, borderRadius: 6, cursor: "pointer",
            border: `1px solid ${border || bg}`, background: bg, color, fontWeight: 600, fontSize: 13,
        };
    }


    