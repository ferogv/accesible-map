// telemetry.js
// Cliente de telemetría: escribe en Firestore (best-effort) y POST al Apps Script Web App.

import { db, collection, addDoc, doc, updateDoc, setDoc, increment } from "./firebase.js";

const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbxsklBFF52oPJmmifsQWOnblXp72OS-PYOluvkaElJxtisUlPY-R1VVGly4iBe98Uz9/exec";

/**
 * Registra un evento: escribe en Firestore y hace POST al Apps Script.
 * data enviado al Web App tiene forma:
 * { timestamp, level, actor, event, spaceId, accessoryId, payload, source }
 */
export async function logEvent({ level = "info", actor = "anon", event = "", payload = {}, source = "" }) {
  const data = {
    timestamp: new Date().toISOString(),
    level,
    actor,
    event,
    spaceId: payload.spaceId || null,
    accessoryId: payload.accessoryId || null,
    payload,
    source
  };

  // Intento 1: escribir en Firestore (best-effort)
  try {
    await addDoc(collection(db, "logs"), {
      timestamp: new Date(), // Date es aceptado por Firestore client
      level: data.level,
      actor: data.actor,
      event: data.event,
      spaceId: data.spaceId,
      accessoryId: data.accessoryId,
      payload: data.payload,
      source: data.source
    });
  } catch (err) {
    console.warn("Firestore telemetry failed:", err);
  }

  // Intento 2: enviar al Apps Script Web App (asegura escritura en Sheet)
  try {
    await fetch(URL_WEB_APP, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  } catch (err) {
    console.error("Apps Script telemetry POST failed:", err);
  }
}

/**
 * Incrementa contador atómico en doc counters/global
 */
export async function incMetric(field, delta = 1) {
  const counterRef = doc(db, "counters", "global");
  try {
    await updateDoc(counterRef, {
      [field]: increment(delta),
      last_update: new Date()
    });
  } catch (err) {
    // Si no existe el doc, crear/mergear
    try {
      await setDoc(counterRef, { [field]: delta, last_update: new Date() }, { merge: true });
    } catch (e2) {
      console.error("Telemetry incMetric failed:", e2);
    }
  }
}