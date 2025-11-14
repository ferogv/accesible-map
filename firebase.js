// firebase.js
// Inicializa Firebase App y exporta utilidades de Firestore (modular v9)

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
  increment,
  setDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

export const firebaseConfig = {
  apiKey: "AIzaSyBxhPVy4UOrjq1NjpJHil4oKHRr7cArRw4",
  authDomain: "accesible-map.firebaseapp.com",
  projectId: "accesible-map",
  storageBucket: "accesible-map.appspot.com",
  messagingSenderId: "741670264244",
  appId: "1:741670264244:web:29dbc1d9900b843e00e6e1"
};

export const app = initializeApp(firebaseConfig);
console.log("Firebase inicializada:", firebaseConfig.projectId);

export const db = getFirestore(app);
console.log("Firestore lista.", db.app.options.projectId);

// Re-export utilidades para uso en otros módulos
export {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
  increment,
  setDoc
};

if (!firebaseConfig.projectId) {
  console.warn("Config Firebase vacía. Agrega tus credenciales en firebase.js");
}

export const auth = getAuth(app);

signInAnonymously(auth)
  .then(() => console.log("Firebase Auth: signed in anonymously"))
  .catch(err => console.warn("Firebase Auth anonymous failed:", err));

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Firebase Auth state:", user.uid, user.isAnonymous ? "anonymous" : "user");
  } else {
    console.log("Firebase Auth: signed out");
  }
});