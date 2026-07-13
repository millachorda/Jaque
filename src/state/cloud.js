import { db, isFirebaseConfigured } from "../auth/firebase.js";
import { doc, getDoc, setDoc } from "firebase/firestore";
export async function loadCloudProgress(uid) {
  if (!isFirebaseConfigured) return null;
  try {
    const snap = await getDoc(doc(db, "progress", uid));
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
}
export async function saveCloudProgress(uid, progress) {
  if (!isFirebaseConfigured) return;
  try {
    await setDoc(doc(db, "progress", uid), progress, {
      merge: true
    });
  } catch {}
}
