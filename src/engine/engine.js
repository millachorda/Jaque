export const START = [
    ["br", "bn", "bb", "bq", "bk", "bb", "bn", "br"],
    ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
    ["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"],
];

export function makeStartBoard() {
    return START.map((row) => row.map((s) => (s ? { type: s[1], color: s[0] } : null)));
}

export const GLYPH = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };
export const Value = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
export const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
export const sq = (r, c) => FILES[c] + (8 - r);

const MATE = 1000000;
const MATE_TH = MATE - 1000; 

function scoreToTT(score, ply) {
    if (score >= MATE_TH) return score + ply;
    if (score <= -MATE_TH) return score - ply;
    return score;
}
function scoreFromTT(score, ply) {
    if (score >= MATE_TH) return score - ply;
    if (score <= -MATE_TH) return score + ply;
    return score;
}

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
        [-10, 0, 5, 5, 5, 5, 0, -10],
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

const KING_END = [
    [-50, -40, -30, -20, -20, -30, -40, -50],
    [-30, -20, -10, 0, 0, -10, -20, -30],
    [-30, -10, 20, 30, 30, 20, -10, -30],
    [-30, -10, 30, 40, 40, 30, -10, -30],
    [-30, -10, 30, 40, 40, 30, -10, -30],
    [-30, -10, 20, 30, 30, 20, -10, -30],
    [-30, -30, 0, 0, 0, 0, -30, -30],
    [-50, -30, -30, -30, -30, -30, -30, -50],
];

const inBounds = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
const cloneBoard = (b) => b.map((row) => row.map((p) => (p ? { ...p } : null)));
export const enemy = (color) => (color === "w" ? "b" : "w");

const DIRS = {
    r: [[-1, 0], [1, 0], [0, -1], [0, 1]],
    b: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
    q: [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]],
    n: [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]],
    k: [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]],
};

export function pieceMoves(board, r, c, enPassant, castling) {
    const piece = board[r][c];
    if (!piece) return [];
    const { type, color } = piece;
    const moves = [];
    const add = (tr, tc, extra = {}) => {
        const target = board[tr][tc];
        moves.push({ from: [r, c], to: [tr, tc], piece: type, captured: target ? target.type : null, ...extra });
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
                moves.push({ from: [r, c], to: [tr, tc], piece: "p", captured: "p", enPassant: true });
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
                    moves.push({ from: [r, c], to: [row, 6], piece: "k", castle: "K", captured: null });
                }
                if (castling[color + "Q"] && !board[row][3] && !board[row][2] && !board[row][1] &&
                    !isAttacked(board, row, 3, opp) && !isAttacked(board, row, 2, opp)) {
                    moves.push({ from: [r, c], to: [row, 2], piece: "k", castle: "Q", captured: null });
                }
            }
        }
        return moves;
    }

    for (const [dr, dc] of DIRS[type]) {
        let tr = r + dr, tc = c + dc;
        while (inBounds(tr, tc)) {
            const t = board[tr][tc];
            if (!t) add(tr, tc);
            else { if (t.color !== color) add(tr, tc); break; }
            tr += dr; tc += dc;
        }
    }
    return moves;
}

export function isAttacked(board, r, c, byColor) {
    const pd = byColor === "w" ? 1 : -1; 
    for (const dc of [-1, 1]) {
        const pr = r + pd, pc = c + dc;
        if (inBounds(pr, pc)) {
            const p = board[pr][pc];
            if (p && p.color === byColor && p.type === "p") return true;
        }
    }
    for (const [dr, dc] of DIRS.n) {
        const tr = r + dr, tc = c + dc;
        if (inBounds(tr, tc)) {
            const p = board[tr][tc];
            if (p && p.color === byColor && p.type === "n") return true;
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
            if (p) { if (p.color === byColor && (p.type === "r" || p.type === "q")) return true; break; }
            tr += dr; tc += dc;
        }
    }
    for (const [dr, dc] of DIRS.b) {
        let tr = r + dr, tc = c + dc;
        while (inBounds(tr, tc)) {
            const p = board[tr][tc];
            if (p) { if (p.color === byColor && (p.type === "b" || p.type === "q")) return true; break; }
            tr += dr; tc += dc;
        }
    }
    return false;
}

export function findKing(board, color) {
    for (let r = 0; r < 8; r++)
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.color === color && p.type === "k") return [r, c];
        }
    return null;
}

export function inCheck(board, color) {
    const k = findKing(board, color);
    if (!k) return false;
    return isAttacked(board, k[0], k[1], enemy(color));
}

export function applyMove(board, move, castling, enPassant) {
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

export function makeMove(state, move) {
    const next = applyMove(state.board, move, state.castling, state.enPassant);
    return { board: next.board, castling: next.castling, enPassant: next.enPassant, turn: enemy(state.turn) };
}

export function legalMoves(board, color, enPassant, castling) {
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

function captureMoves(board, color, enPassant, castling) {
    const result = [];
    for (let r = 0; r < 8; r++)
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (!p || p.color !== color) continue;
            for (const m of pieceMoves(board, r, c, enPassant, castling)) {
                if (!m.captured && !m.promotion) continue;
                const next = applyMove(board, m, castling, enPassant);
                if (!inCheck(next.board, color)) result.push(m);
            }
        }
    return result;
}

const PHASE_W = { p: 0, n: 1, b: 1, r: 2, q: 4, k: 0 };
const PHASE_MAX = 24; 

function evaluate(board) {
    let mg = 0, phase = 0;
    const pawns = { w: Array.from({ length: 8 }, () => []), b: Array.from({ length: 8 }, () => []) };
    const rooks = { w: [], b: [] };
    const bishops = { w: 0, b: 0 };
    const kings = {};

    for (let r = 0; r < 8; r++)
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (!p) continue;
            phase += PHASE_W[p.type];
            const white = p.color === "w";
            const rr = white ? r : 7 - r;
            if (p.type === "p") pawns[p.color][c].push(r);
            else if (p.type === "b") bishops[p.color]++;
            else if (p.type === "r") rooks[p.color].push([r, c]);
            else if (p.type === "k") { kings[p.color] = [r, c]; continue; }
            const base = Value[p.type] + PST[p.type][rr][c];
            mg += white ? base : -base;
        }

    const phaseClamped = Math.min(phase, PHASE_MAX);
    const mgWeight = phaseClamped / PHASE_MAX;   
    const egWeight = 1 - mgWeight;

    let kingScore = 0;
    for (const color of ["w", "b"]) {
        const k = kings[color];
        if (!k) continue;
        const white = color === "w";
        const rr = white ? k[0] : 7 - k[0];
        const kMg = Value.k + PST.k[rr][k[1]];
        const kEg = Value.k + KING_END[rr][k[1]];
        kingScore += (white ? 1 : -1) * (kMg * mgWeight + kEg * egWeight);
    }

    let pawnScore = 0;
    for (const color of ["w", "b"]) {
        const sign = color === "w" ? 1 : -1;
        const my = pawns[color], opp = pawns[color === "w" ? "b" : "w"];
        for (let f = 0; f < 8; f++) {
            const list = my[f];
            const n = list.length;
            if (n > 1) pawnScore -= sign * 12 * (n - 1);
            const left = f > 0 ? my[f - 1].length : 0;
            const right = f < 7 ? my[f + 1].length : 0;
            if (n > 0 && left === 0 && right === 0) pawnScore -= sign * 15;
            for (const pr of list) {                     
                let passed = true;
                for (const ff of [f - 1, f, f + 1]) {
                    if (ff < 0 || ff > 7) continue;
                    for (const opr of opp[ff]) {
                        if (color === "w" ? opr < pr : opr > pr) { passed = false; break; }
                    }
                    if (!passed) break;
                }
                if (passed) {
                    const adv = color === "w" ? 7 - pr : pr;
                    pawnScore += sign * (15 + adv * adv * 3);
                }
            }
        }
    }

    let rookScore = 0;
    for (const color of ["w", "b"]) {
        const sign = color === "w" ? 1 : -1;
        const opp = color === "w" ? "b" : "w";
        for (const [, c] of rooks[color]) {
            const own = pawns[color][c].length, ot = pawns[opp][c].length;
            if (own === 0 && ot === 0) rookScore += sign * 22;
            else if (own === 0) rookScore += sign * 11;
        }
    }

    let kingSafety = 0;
    for (const color of ["w", "b"]) {
        const k = kings[color];
        if (!k) continue;
        const sign = color === "w" ? 1 : -1;
        const dir = color === "w" ? -1 : 1;
        let shield = 0;
        for (const dc of [-1, 0, 1]) {
            const fc = k[1] + dc, fr = k[0] + dir;
            if (fc < 0 || fc > 7 || fr < 0 || fr > 7) continue;
            const pp = board[fr][fc];
            if (pp && pp.type === "p" && pp.color === color) shield++;
        }
        kingSafety += sign * (shield - 3) * 12 * mgWeight;
    }

    let bishopPair = 0;
    if (bishops.w >= 2) bishopPair += 30;
    if (bishops.b >= 2) bishopPair -= 30;

    return mg + kingScore + pawnScore + rookScore + kingSafety + bishopPair;
}

function evalSTM(state) {
    const s = evaluate(state.board);
    return state.turn === "w" ? s : -s;
}

function sameMove(a, b) {
    return a && b && a.from[0] === b.from[0] && a.from[1] === b.from[1] &&
        a.to[0] === b.to[0] && a.to[1] === b.to[1];
}
const histKey = (m) => `${m.from[0]}${m.from[1]}${m.to[0]}${m.to[1]}`;

function scoreMove(m, board, ttMove, killers, history) {
    if (ttMove && sameMove(m, ttMove)) return 1000000;
    if (m.captured) {
        const victim = Value[m.captured] || 0;
        const attacker = Value[m.piece] || 0;
        return 100000 + victim * 10 - attacker;
    }
    if (m.promotion) return 90000 + Value[m.promotion];
    if (killers) {
        if (sameMove(m, killers[0])) return 80000;
        if (sameMove(m, killers[1])) return 79000;
    }
    return history[histKey(m)] || 0;
}

function orderMoves(moves, board, ttMove, killers, history) {
    for (const m of moves) m._s = scoreMove(m, board, ttMove, killers, history);
    moves.sort((a, b) => b._s - a._s);
    return moves;
}

const FLAG_EXACT = 0, FLAG_LOWER = 1, FLAG_UPPER = 2;
function ttKey(state) {
    let s = state.turn;
    const b = state.board;
    for (let r = 0; r < 8; r++)
        for (let c = 0; c < 8; c++) {
            const p = b[r][c];
            s += p ? p.color + p.type : ".";
        }
    const cs = state.castling;
    s += (cs.wK ? "K" : "") + (cs.wQ ? "Q" : "") + (cs.bK ? "k" : "") + (cs.bQ ? "q" : "");
    if (state.enPassant) s += "e" + state.enPassant[0] + state.enPassant[1];
    return s;
}

function quiesce(state, alpha, beta, ply, ctx) {
    ctx.nodes++;
    const checked = inCheck(state.board, state.turn);

    if (!checked) {
        const standPat = evalSTM(state);
        if (standPat >= beta) return beta;
        if (standPat > alpha) alpha = standPat;
    }

    const moves = checked
        ? legalMoves(state.board, state.turn, state.enPassant, state.castling)
        : captureMoves(state.board, state.turn, state.enPassant, state.castling);

    if (checked && moves.length === 0) return -MATE + ply;
    orderMoves(moves, state.board, null, null, EMPTY_HIST);

    for (const m of moves) {
        const ns = makeMove(state, m);
        const score = -quiesce(ns, -beta, -alpha, ply + 1, ctx);
        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
    }
    return alpha;
}

const EMPTY_HIST = {};

function hasNonPawnMaterial(board, color) {
    for (let r = 0; r < 8; r++)
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.color === color && p.type !== "p" && p.type !== "k") return true;
        }
    return false;
}

function negamax(state, depth, alpha, beta, ply, ctx) {
    if ((ctx.nodes & 2047) === 0 && performance.now() - ctx.start > ctx.timeMs) {
        ctx.stop = true; return 0;
    }
    const alphaOrig = alpha;
    const key = ttKey(state);
    const e = ctx.tt.get(key);
    if (e && e.depth >= depth) {
        const es = scoreFromTT(e.score, ply);
        if (e.flag === FLAG_EXACT) return es;
        if (e.flag === FLAG_LOWER && es > alpha) alpha = es;
        else if (e.flag === FLAG_UPPER && es < beta) beta = es;
        if (alpha >= beta) return es;
    }

    const checked = inCheck(state.board, state.turn);
     if (checked) depth += 1;

    if (depth === 0) return quiesce(state, alpha, beta, ply, ctx);

    if (!checked && depth >= 3 && beta < MATE_TH && hasNonPawnMaterial(state.board, state.turn)) {
        const nullState = { board: state.board, turn: enemy(state.turn), castling: state.castling, enPassant: null };
        const R = 2;
        const score = -negamax(nullState, depth - 1 - R, -beta, -beta + 1, ply + 1, ctx);
        if (ctx.stop) return 0;
        if (score >= beta) return beta;
    }

    const moves = legalMoves(state.board, state.turn, state.enPassant, state.castling);
    if (moves.length === 0) {
        return checked ? -MATE + ply : 0;
    }
    ctx.nodes++;

    const killers = ctx.killers[ply] || (ctx.killers[ply] = [null, null]);
    orderMoves(moves, state.board, e ? e.move : null, killers, ctx.history);

    let best = -Infinity, bestMove = null;
    for (const m of moves) {
        const ns = makeMove(state, m);
        const score = -negamax(ns, depth - 1, -beta, -alpha, ply + 1, ctx);
        if (ctx.stop) return best === -Infinity ? 0 : best;
        if (score > best) { best = score; bestMove = m; }
        if (best > alpha) alpha = best;
        if (alpha >= beta) {
            if (!m.captured && !m.promotion) {
                if (!sameMove(killers[0], m)) { killers[1] = killers[0]; killers[0] = m; }
                ctx.history[histKey(m)] = (ctx.history[histKey(m)] || 0) + depth * depth;
            }
            break;
        }
    }

    let flag = FLAG_EXACT;
    if (best <= alphaOrig) flag = FLAG_UPPER;
    else if (best >= beta) flag = FLAG_LOWER;
    ctx.tt.set(key, { depth, score: scoreToTT(best, ply), flag, move: bestMove });
    return best;
}

function searchRoot(state, depth, ctx, prevBest) {
    let moves = legalMoves(state.board, state.turn, state.enPassant, state.castling);
    if (moves.length === 0) return { scores: [], best: null, score: 0 };

    orderMoves(moves, state.board, prevBest, ctx.killers[0] || [null, null], ctx.history);

    const scores = [];
    let bestMove = null, bestScore = -Infinity;

    for (const m of moves) {
        const ns = makeMove(state, m);
        const score = -negamax(ns, depth - 1, -Infinity, Infinity, 1, ctx);
        if (ctx.stop) break;
        scores.push({ move: m, score });
        if (score > bestScore) { bestScore = score; bestMove = m; }
    }
    scores.sort((a, b) => b.score - a.score);
    return { scores, best: bestMove, score: bestScore };
}

export function strengthFor(skill) {
    const s = Math.max(0, Math.min(20, skill | 0));
    const depth = Math.max(1, Math.min(6, 1 + Math.floor(s / 3.5)));
    const timeMs = Math.round(150 + (s / 20) * 1650);
    const window = Math.round(Math.max(0, (12 - s) * 22));   
    const blunder = Math.max(0, (6 - s)) * 0.05;
    return { skill: s, depth, timeMs, window, blunder };
}

function pickBySkill(scores, cfg, rng) {
    if (scores.length === 0) return null;
    if (scores.length === 1) return scores[0];
    if (cfg.blunder > 0 && rng() < cfg.blunder) {
        const pool = scores.slice(0, Math.max(2, Math.ceil(scores.length * 0.8)));
        return pool[Math.floor(rng() * pool.length)];
    }
    const best = scores[0].score;
    const near = scores.filter((x) => best - x.score <= cfg.window);
    return near[Math.floor(rng() * near.length)];
}

export function think(state, opts = {}) {
    const cfg = opts.skill != null ? strengthFor(opts.skill) : {
        skill: 20, depth: opts.maxDepth || 4, timeMs: opts.timeMs || 2000, window: 0, blunder: 0,
    };
    const maxDepth = opts.maxDepth || cfg.depth;
    const timeMs = opts.timeMs || cfg.timeMs;
    const rng = opts.rng || Math.random;

    const ctx = {
        nodes: 0, start: (typeof performance !== "undefined" ? performance : Date).now(),
        timeMs, stop: false, tt: new Map(), killers: [], history: {},
    };

    let completed = null, prevBest = null, reached = 0;
    for (let d = 1; d <= maxDepth; d++) {
        const res = searchRoot(state, d, ctx, prevBest);
        if (ctx.stop) break;               
        prevBest = res.best;
        reached = d;
        if (Math.abs(res.score) > MATE - 1000) break; 
        if ((typeof performance !== "undefined" ? performance : Date).now() - ctx.start > timeMs) break;
    }

    const ms = Math.round((typeof performance !== "undefined" ? performance : Date).now() - ctx.start);
    if (!completed || completed.scores.length === 0) {
        const fallback = legalMoves(state.board, state.turn, state.enPassant, state.castling);
        return { move: fallback[0] || null, score: 0, nodes: ctx.nodes, depth: reached, ms };
    }
    const chosen = pickBySkill(completed.scores, cfg, rng);
    return { move: chosen.move, score: chosen.score, nodes: ctx.nodes, depth: reached, ms };
}

export function gameStatus(board, color, castling, enPassant) {
    const moves = legalMoves(board, color, enPassant, castling);
    if (moves.length === 0) return inCheck(board, color) ? "checkmate" : "stalemate";
    return inCheck(board, color) ? "check" : "playing";
}

export function analyze(state, opts = {}) {
    const maxDepth = opts.maxDepth || 4;
    const timeMs = opts.timeMs || 1500;
    const nowfn = () => (typeof performance !== "undefined" ? performance : Date).now();
    const ctx = { nodes: 0, start: nowfn(), timeMs, stop: false, tt: new Map(), killers: [], history: {} };
    let completed = null, prevBest = null;
    for (let d = 1; d <= maxDepth; d++) {
        const res = searchRoot(state, d, ctx, prevBest);
        if (ctx.stop) break;
        completed = res; prevBest = res.best;
        if (Math.abs(res.score) > MATE - 1000) break;
        if (nowfn() - ctx.start > timeMs) break;
    }
    return completed ? completed.scores : [];
}

export function movesEqual(a, b) { return sameMove(a, b); }

export function toSAN(state, move) {
    if (move.castle === "K") return "O-O";
    if (move.castle === "Q") return "O-O-O";
    const letter = move.piece === "p" ? "" : move.piece.toUpperCase();
    const dest = sq(move.to[0], move.to[1]);
    const cap = move.captured ? "x" : "";
    const from = move.piece === "p" && move.captured ? FILES[move.from[1]] : "";
    const promo = move.promotion ? "=" + move.promotion.toUpperCase() : "";
    const ns = makeMove(state, move);
    const check = inCheck(ns.board, ns.turn) ? "+" : "";
    return `${letter}${from}${cap}${dest}${promo}${check}`;
}

export function analyzeMove(state, playerMove, opts = {}) {
    const scores = analyze(state, opts);
    if (scores.length === 0) return null;
    const best = scores[0];
    const mine = scores.find((s) => sameMove(s.move, playerMove)) || { move: playerMove, score: best.score };
    const loss = Math.round(best.score - mine.score);     
    const threshold = opts.threshold || 90;
    const betterExists = loss >= threshold && !sameMove(best.move, playerMove);
    return {
        best: best.move,
        bestSan: toSAN(state, best.move),
        bestScore: best.score,
        playerScore: mine.score,
        loss,
        betterExists,
        explanation: betterExists ? explainMove(state, best.move, loss) : null,
    };
}

function explainMove(state, best, loss) {
    const san = toSAN(state, best);
    const ns = makeMove(state, best);
    const givesCheck = inCheck(ns.board, ns.turn);
    let reason;
    if (loss > 400) {
        reason = "tu jugada regala material o una pieza importante";
    } else if (best.captured) {
        reason = `captura en ${sq(best.to[0], best.to[1])} y gana material`;
    } else if (givesCheck) {
        reason = "da jaque y mantiene la iniciativa";
    } else if (best.piece === "n" || best.piece === "b") {
        reason = "desarrolla una pieza hacia una casilla activa";
    } else if (best.piece === "p") {
        reason = "mejora tu estructura y gana espacio";
    } else {
        reason = "mejora tu posición";
    }
    const pts = (loss / 100).toFixed(1);
    return `Había algo mejor: ${san}. ${cap1(reason)} (unos ${pts} puntos mejor).`;
}

function cap1(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
