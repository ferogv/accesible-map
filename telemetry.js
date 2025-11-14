// telemetry.js
// Escritura "dual": Firestore (best-effort) + POST a Apps Script Web App.

import { db, collection, addDoc, doc, updateDoc, setDoc, increment } from "./firebase.js";

// URL del Web App
const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbyVu_dlXDJhE_JzT019I7W4FDdEkHVu7hwBZ__1odfU_sXav-RtiFA1FW5yyfkPzvx5/exec";

/**
 * Escribe un evento estructurado en Firestore y lo POSTea al Apps Script.
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

  console.log("telemetry.logEvent CALLED", { event: data.event, source: data.source, payload: data.payload });

  // 1) Firestore (best-effort)
  try {
    await addDoc(collection(db, "logs"), {
      timestamp: new Date(),
      level: data.level,
      actor: data.actor,
      event: data.event,
      spaceId: data.spaceId,
      accessoryId: data.accessoryId,
      payload: data.payload,
      source: data.source
    });
    console.log("telemetry: wrote to Firestore logs");
  } catch (err) {
    console.warn("telemetry: Firestore write failed", err);
  }

  // 2) Apps Script POST
  if (!URL_WEB_APP) return;

  try {
    const response = await fetch(URL_WEB_APP, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "omit"
    });

    // leer texto (Apps Script devuelve HTML con JSON dentro)
    const text = await response.text();

    // intentar parsear JSON directo
    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      // si viene envuelto en HTML, extraer el JSON dentro de llaves
      const match = text.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : null;
    }

    if (parsed && parsed.ok) {
      console.log("telemetry: POST to Apps Script OK");
    } else {
      console.warn("telemetry: Apps Script responded", parsed, "raw:", text);
    }
  } catch (err) {
    console.warn("telemetry: Apps Script POST failed (ignored)", err);
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
    console.log("telemetry: incMetric updated", { field, delta });
  } catch (err) {
    // Si no existe, crear/mergear
    try {
      await setDoc(counterRef, { [field]: delta, last_update: new Date() }, { merge: true });
      console.log("telemetry: incMetric created", { field, delta });
    } catch (e2) {
      console.error("telemetry incMetric failed:", e2);
    }
  }
}
