// telemetry.js
// Escritura "dual": Firestore (best-effort) + POST a Apps Script Web App.
// Ajusta URL_WEB_APP con tu Web App URL si la usas.

import { db, collection, addDoc, doc, updateDoc, setDoc, increment } from "./firebase.js";

const URL_WEB_APP = "https://script.google.com/macros/s/AKfycbxsklBFF52oPJmmifsQWOnblXp72OS-PYOluvkaElJxtisUlPY-R1VVGly4iBe98Uz9/exec";

/**
 * Escribe un evento estructurado en Firestore y lo POSTea al Apps Script.
 * eventObj: { level,event,actor,payload,source,spaceId,accessoryId }
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

  // 2) Apps Script POST (optional, ensures Sheet gets the row)
  try {
    if (URL_WEB_APP && URL_WEB_APP.startsWith("https://script.google.com/macros/s/AKfycbyVu_dlXDJhE_JzT019I7W4FDdEkHVu7hwBZ__1odfU_sXav-RtiFA1FW5yyfkPzvx5/exec")) {
      await fetch(URL_WEB_APP, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "omit"
      });
      //El Apps Script devuelve HTML con JSON dentro; leer texto y parsear JSON
      const text = await response.text();
      //Intentar localizar JSON dentro del HTML (el script devuelve solo JSON en el body)
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        // Si viene envuelto en HTML, intentar extraer la parte JSON entre { }
        const match = text.match(/{[\s\S]*}/);
        parsed = match ? JSON.parse(match[0]) : null;
      }
      if (parsed && parsed.ok) {
        console.log("telemetry: POST to Apps Script OK");
      } else {
        console.warn("telemetry: Apps Scriptresponded", parsed);
      }
    }
    } catch (err) {
      console.error("telemetry: Apps Script POST failed", err);
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
