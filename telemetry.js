export async function logEvent({ level = "info", actor = "anon", event = "", payload = {}, source = "" }) {
  console.log("telemetry.logEvent CALLED", { event, source, payload });
  const data = {
    timestamp: new Date().toISOString(),
    level, actor, event,
    spaceId: payload.spaceId || null,
    accessoryId: payload.accessoryId || null,
    payload, source
  };

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

  try {
    await fetch(URL_WEB_APP, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    console.log("telemetry: POST to Apps Script OK");
  } catch (err) {
    console.error("telemetry: Apps Script POST failed", err);
  }
}