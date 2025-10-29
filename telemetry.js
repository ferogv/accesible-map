import { db, collection, addDoc, doc, updateDoc, setDoc, increment } from "./firebase.js";

export async function logEvent({ level = "info", actor = "anon", event = "", payload = {}, source = "" }) {
  try {
    await addDoc(collection(db, "logs"), {
      timestamp: new Date(),
      level,
      actor,
      event,
      spaceId: payload.spaceId || null,
      accessoryId: payload.accessoryId || null,
      payload,
      source
    });
  } catch (err) {
    console.error("Telemetry log failed:", err);
  }
}

export async function incMetric(field, delta = 1) {
  const counterRef = doc(db, "counters", "global");
  try {
    await updateDoc(counterRef, {
      [field]: increment(delta),
      last_update: new Date()
    });
  } catch (err) {
    try {
      await setDoc(counterRef, { [field]: delta, last_update: new Date() }, { merge: true });
    } catch (e2) {
      console.error("Telemetry incMetric failed:", e2);
    }
  }
}