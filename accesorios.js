// accesorios.js
import { db, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, increment } from "./firebase.js";
import { logEvent, incMetric } from "./telemetry.js";

console.log("accesorios.js loaded — telemetry functions imported");

export async function addAccessory(spaceId, name, quantity = 1) {
  if (!name || quantity <= 0) throw new Error("Datos inválidos");

  // escribe en Firestore y obtiene el id del documento
  const ref = collection(db, "spaces", spaceId, "accessories");
  const docRef = await addDoc(ref, { name, quantity });

  // Telemetría (best-effort). Usa docRef.id y las variables correctas.
  try {
    await logEvent({
      level: "info",
      actor: "anon",
      event: "accessory.add",
      payload: { spaceId, accessoryId: docRef.id, name, quantity },
      source: "accesorios.js"
    });
    await incMetric("accessories_added", 1);
    console.log("telemetry: accessory.add recorded", { spaceId, accessoryId: docRef.id, name, quantity });
  } catch (e) {
    console.warn("telemetry addAccessory failed", e);
  }

  return docRef;
}

export async function removeAccessory(spaceId, accessoryId) {
  const ref = doc(db, "spaces", spaceId, "accessories", accessoryId);
  await deleteDoc(ref);

  try {
    await logEvent({
      level: "info",
      actor: "anon",
      event: "accessory.delete",
      payload: { spaceId, accessoryId },
      source: "accesorios.js"
    });
    await incMetric("accessories_deleted", 1);
    console.log("telemetry: accessory.delete recorded", { spaceId, accessoryId });
  } catch (e) {
    console.warn("telemetry removeAccessory failed", e);
  }
}

export async function getAccessories(spaceId) {
  const ref = collection(db, "spaces", spaceId, "accessories");
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Actualiza cantidad usando incremento atómico
export async function updateAccessoryQty(spaceId, accessoryId, delta) {
  if (!spaceId || !accessoryId || !Number.isInteger(delta)) {
    throw new Error("Parámetros inválidos");
  }
  const ref = doc(db, "spaces", spaceId, "accessories", accessoryId);
  await updateDoc(ref, { quantity: increment(delta) });

  try {
    await logEvent({
      level: "info",
      actor: "anon",
      event: "accessory.update",
      payload: { spaceId, accessoryId, delta }, // delta = +1 o -1
      source: "accesorios.js"
    });
    await incMetric("accessories_updated", 1);
    console.log("telemetry: accessory.update recorded", { spaceId, accessoryId, delta });
  } catch (e) {
    console.warn("telemetry updateAccessoryQty failed", e);
  }
}
