import { db, collection, addDoc, doc, updateDoc, setDoc, increment } from "./firebase.js";

const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbxsklBFF52oPJmmifsQWOnblXp72OS-PYOluvkaElJxtisUlPY-R1VVGly4iBe98Uz9/exec"

export async function logEvent({ level = "info", actor = "anon", event = "", payload = {}, source = "" }) {
  try {
    await addDoc(collection(db, "logs"), {
      timestamp: new Date().toISOString(),
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

// Intento 1: enviar a Firestore (best-effort)
  try {
    await addDoc(collection(db, "logs"), { timestamp: new Date(), level, actor, event, spaceId: data.spaceId, accessoryId: data.accessoryId, payload, source });
  } catch (err) {
    console.warn("Firestore telemetry failed:", err);
  }

  // Intento 2: enviar al Apps Script (garantiza que la Sheet reciba los eventos)
  try {
    await fetch(URL_WEB_APP, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  } catch (err) {
    console.error("Apps Script telemetry POST failed:", err);
  }
