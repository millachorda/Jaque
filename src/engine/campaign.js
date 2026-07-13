export const TOTAL_LEVELS = 1000;

export const CHAPTERS = [
    { from: 1, to: 50, name: "Primeros pasos", theme: "Domina el movimiento de las piezas y no cuelgues material." },
    { from: 51, to: 120, name: "El valor de las piezas", theme: "Cambios favorables y desarrollo sano." },
    { from: 121, to: 200, name: "Táctica: horquillas", theme: "Ataca dos piezas a la vez." },
    { from: 201, to: 280, name: "Táctica: clavadas", theme: "Inmoviliza piezas contra el rey o la dama." },
    { from: 281, to: 360, name: "Táctica: enfiladas", theme: "Obliga a mover para ganar lo de detrás." },
    { from: 361, to: 440, name: "El mate del pasillo", theme: "Debilidades en la última fila." },
    { from: 441, to: 540, name: "Ataque al rey", theme: "Sacrificios y apertura de líneas." },
    { from: 541, to: 640, name: "Medio juego posicional", theme: "Columnas abiertas, casillas fuertes, buen y mal alfil." },
    { from: 641, to: 740, name: "Finales de peones", theme: "Oposición, peón pasado y la regla del cuadrado." },
    { from: 741, to: 840, name: "Finales de piezas", theme: "Técnica de torre y de piezas menores." },
    { from: 841, to: 940, name: "El gran maestro", theme: "El motor juega casi a plena fuerza." },
    { from: 941, to: 1000, name: "Leyenda", theme: "Máxima fuerza. Solo para los mejores." },
];

export function chapterOf(level) {
    return CHAPTERS.find((c) => level >= c.from && level <= c.to) || CHAPTERS[CHAPTERS.length - 1];
}

export function skillForLevel(level) {
    const t = (level - 1) / (TOTAL_LEVELS - 1);      // 0..1
    const curved = Math.pow(t, 1.15);                 // arranca fácil, sube al final
    return Math.round(curved * 20);                   // 0..20
}

function P(type, color) { return { type, color }; }
function emptyBoard() { return Array.from({ length: 8 }, () => Array(8).fill(null)); }

const PUZZLES = [
    () => {
        const b = emptyBoard();
        b[0][6] = P("k", "b"); b[1][5] = P("p", "b"); b[1][6] = P("p", "b"); b[1][7] = P("p", "b");
        b[7][2] = P("r", "w"); b[7][4] = P("k", "w");
        return { board: b, turn: "w", castling: { wK: 0, wQ: 0, bK: 0, bQ: 0 }, enPassant: null, mateIn: 1 };
    },
    () => {
        const b = emptyBoard();
        b[0][6] = P("k", "b");
        b[2][6] = P("k", "w"); b[2][0] = P("q", "w");
        return { board: b, turn: "w", castling: { wK: 0, wQ: 0, bK: 0, bQ: 0 }, enPassant: null, mateIn: 1 };
    },
    () => {
        const b = emptyBoard();
        b[0][4] = P("k", "b");
        b[6][0] = P("r", "w"); b[7][1] = P("r", "w"); b[7][7] = P("k", "w");
        return { board: b, turn: "w", castling: { wK: 0, wQ: 0, bK: 0, bQ: 0 }, enPassant: null, mateIn: 2 };
    },
     () => {
        const b = emptyBoard();
        b[0][7] = P("k", "b"); b[1][6] = P("p", "b");
        b[2][5] = P("n", "w"); b[3][3] = P("q", "w"); b[7][4] = P("k", "w");
        return { board: b, turn: "w", castling: { wK: 0, wQ: 0, bK: 0, bQ: 0 }, enPassant: null, mateIn: 1 };
    },
    () => {
        const b = emptyBoard();
        b[0][6] = P("k", "b"); b[1][5] = P("p", "b"); b[1][6] = P("p", "b"); b[1][7] = P("p", "b");
        b[3][2] = P("b", "w"); b[7][3] = P("q", "w"); b[7][4] = P("k", "w"); b[7][0] = P("r", "w");
        return { board: b, turn: "w", castling: { wK: 0, wQ: 0, bK: 0, bQ: 0 }, enPassant: null, mateIn: 2 };
    },
];

export function puzzleCount() { return PUZZLES.length; }

export function getLevel(n) {
    const level = Math.max(1, Math.min(TOTAL_LEVELS, n | 0));
    const chapter = chapterOf(level);
    const skill = skillForLevel(level);

    const isMilestone = level % 25 === 0;
    if (isMilestone) {
        const puzzle = PUZZLES[(level / 25 - 1) % PUZZLES.length]();
        return {
            level, skill, chapter: chapter.name,
            kind: "puzzle",
            title: `Nivel ${level} · Puzzle: mate en ${puzzle.mateIn}`,
            goal: `Da mate en ${puzzle.mateIn} jugada${puzzle.mateIn > 1 ? "s" : ""}.`,
            start: { board: puzzle.board, turn: puzzle.turn, castling: puzzle.castling, enPassant: puzzle.enPassant },
            playerColor: puzzle.turn,
            mateIn: puzzle.mateIn,
            engineSkill: Math.min(20, skill + 4),
        };
    }

    return {
        level, skill, chapter: chapter.name,
        kind: "game",
        title: `Nivel ${level} · ${chapter.name}`,
        goal: chapter.theme,
        start: null,
        playerColor: level % 2 === 1 ? "w" : "b", 
        engineSkill: skill,
    };
}

export function levelsRange(from, to) {
    const out = [];
    for (let n = from; n <= to; n++) {
        const ch = chapterOf(n);
        out.push({
            level: n,
            skill: skillForLevel(n),
            chapter: ch.name,
            kind: n % 25 === 0 ? "puzzle" : "game",
        });
    }
    return out;
}

export function starsFor(kind, result) {
    if (kind === "puzzle") return result === "win" ? 3 : 0;
    if (result === "win") return 3;
    if (result === "draw") return 1;
    return 0;
}

export function isPassed(kind, result) {
    return starsFor(kind, result) > 0;
}
