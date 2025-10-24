// accesorios.js
import { db, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, increment } from "./firebase.js";

export async function addAccessory(spaceId, name, quantity = 1) {
  if (!name || quantity <= 0) throw new Error("Datos inválidos");
  const ref = collection(db, "spaces", spaceId, "accessories");
  return await addDoc(ref, { name, quantity });
}

export async function removeAccessory(spaceId, accessoryId) {
  const ref = doc(db, "spaces", spaceId, "accessories", accessoryId);
  await deleteDoc(ref);
}

export async function getAccessories(spaceId) {
  const ref = collection(db, "spaces", spaceId, "accessories");
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Cambiar cantidad de un accesorio existente
export async function updateAccessoryQty(spaceId, accessoryId, delta) {
  const ref = doc(db, "spaces", spaceId, "accessories", accessoryId);
  await updateDoc(ref, {
    quantity: increment(delta) // delta puede ser +1 o -1
  });
}
