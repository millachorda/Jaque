import { db, isFirebaseConfigured } from "../auth/firebase.js";
import { collection, doc, addDoc, getDocs, updateDoc, onSnapshot, query, where, limit, orderBy, serverTimestamp, runTransaction } from "firebase/firestore";
import { makeStartBoard, applyMove, enemy, gameStatus } from "../engine/engine.js";
export function boardToFlat(board) {
  const flat = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = board[r][c];
    flat.push(p ? p.color + p.type : "");
  }
  return flat;
}
export function flatToBoard(flat) {
  const b = Array.from({
    length: 8
  }, () => Array(8).fill(null));
  for (let i = 0; i < 64; i++) {
    const s = flat[i];
    if (s) b[i / 8 | 0][i % 8] = {
      color: s[0],
      type: s[1]
    };
  }
  return b;
}
const epToStr = ep => ep ? `${ep[0]},${ep[1]}` : "";
const strToEp = s => s ? s.split(",").map(Number) : null;
function ensure() {
  if (!isFirebaseConfigured) throw new Error("El online no está configurado. Rellena firebase.js.");
}
export async function findOrJoinGame(user) {
  ensure();
  const uid = user.uid;
  const name = user.displayName || (user.email ? user.email.split("@")[0] : "Jugador");
  const games = collection(db, "games");
  const q = query(games, where("status", "==", "waiting"), limit(5));
  const snap = await getDocs(q);
  for (const d of snap.docs) {
    const data = d.data();
    if (data.private) continue;
    if (data.players?.w === uid) continue;
    try {
      const joined = await runTransaction(db, async tx => {
        const ref = doc(db, "games", d.id);
        const fresh = await tx.get(ref);
        if (!fresh.exists()) return false;
        const g = fresh.data();
        if (g.status !== "waiting" || g.players.b) return false;
        tx.update(ref, {
          status: "active",
          "players.b": uid,
          "names.b": name,
          updatedAt: serverTimestamp()
        });
        return true;
      });
      if (joined) return {
        gameId: d.id,
        color: "b"
      };
    } catch {}
  }
  const ref = await addDoc(games, {
    status: "waiting",
    private: false,
    players: {
      w: uid,
      b: null
    },
    names: {
      w: name,
      b: ""
    },
    board: boardToFlat(makeStartBoard()),
    turn: "w",
    castling: {
      wK: true,
      wQ: true,
      bK: true,
      bQ: true
    },
    enPassant: "",
    lastMove: "",
    result: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return {
    gameId: ref.id,
    color: "w"
  };
}
export function subscribeGame(gameId, cb) {
  ensure();
  const ref = doc(db, "games", gameId);
  return onSnapshot(ref, snap => {
    if (!snap.exists()) return;
    const g = snap.data();
    cb({
      id: gameId,
      status: g.status,
      players: g.players,
      names: g.names,
      board: flatToBoard(g.board),
      turn: g.turn,
      castling: g.castling,
      enPassant: strToEp(g.enPassant),
      lastMove: g.lastMove ? g.lastMove.split(",").map(Number) : null,
      result: g.result
    });
  });
}
export async function sendMove(game, move, myColor) {
  ensure();
  if (game.turn !== myColor) throw new Error("No es tu turno.");
  const next = applyMove(game.board, move, game.castling, game.enPassant);
  const nextTurn = enemy(myColor);
  const status = gameStatus(next.board, nextTurn, next.castling, next.enPassant);
  let result = "";
  let docStatus = "active";
  if (status === "checkmate") {
    result = myColor;
    docStatus = "finished";
  } else if (status === "stalemate") {
    result = "draw";
    docStatus = "finished";
  }
  await updateDoc(doc(db, "games", game.id), {
    board: boardToFlat(next.board),
    turn: nextTurn,
    castling: next.castling,
    enPassant: epToStr(next.enPassant),
    lastMove: `${move.from[0]},${move.from[1]},${move.to[0]},${move.to[1]}`,
    status: docStatus,
    result,
    updatedAt: serverTimestamp()
  });
}
export async function resignGame(game, myColor) {
  ensure();
  await updateDoc(doc(db, "games", game.id), {
    status: "finished",
    result: enemy(myColor),
    updatedAt: serverTimestamp()
  });
}
function genCode() {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return s;
}
export async function createPrivateGame(user) {
  ensure();
  const name = user.displayName || (user.email ? user.email.split("@")[0] : "Jugador");
  const code = genCode();
  const ref = await addDoc(collection(db, "games"), {
    status: "waiting",
    private: true,
    code,
    players: {
      w: user.uid,
      b: null
    },
    names: {
      w: name,
      b: ""
    },
    board: boardToFlat(makeStartBoard()),
    turn: "w",
    castling: {
      wK: true,
      wQ: true,
      bK: true,
      bQ: true
    },
    enPassant: "",
    lastMove: "",
    result: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return {
    gameId: ref.id,
    color: "w",
    code
  };
}
export async function joinByCode(user, code) {
  ensure();
  const name = user.displayName || (user.email ? user.email.split("@")[0] : "Jugador");
  const q = query(collection(db, "games"), where("code", "==", code.toUpperCase()), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) throw new Error("No existe ninguna partida con ese código.");
  const d = snap.docs[0];
  const joined = await runTransaction(db, async tx => {
    const ref = doc(db, "games", d.id);
    const fresh = await tx.get(ref);
    if (!fresh.exists()) return false;
    const g = fresh.data();
    if (g.status !== "waiting" || g.players.b) return false;
    if (g.players.w === user.uid) return false;
    tx.update(ref, {
      status: "active",
      "players.b": user.uid,
      "names.b": name,
      updatedAt: serverTimestamp()
    });
    return true;
  });
  if (!joined) throw new Error("Esa partida ya no está disponible.");
  return {
    gameId: d.id,
    color: "b"
  };
}
export async function sendChat(gameId, user, text) {
  ensure();
  const t = (text || "").trim().slice(0, 300);
  if (!t) return;
  await addDoc(collection(db, "games", gameId, "messages"), {
    uid: user.uid,
    name: user.displayName || (user.email ? user.email.split("@")[0] : "Jugador"),
    text: t,
    createdAt: serverTimestamp()
  });
}
export function subscribeChat(gameId, cb) {
  ensure();
  const q = query(collection(db, "games", gameId, "messages"), orderBy("createdAt", "asc"), limit(200));
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    })));
  });
}
