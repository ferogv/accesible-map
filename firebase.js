// firebase.js
// Inicializa Firebase App y exporta Firestore (modular v9)

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyBxhPVy4UOrjq1NjpJHil4oKHRr7cArRw4",
  authDomain: "accesible-map.firebaseapp.com",
  projectId: "accesible-map",
  storageBucket: "accesible-map.appspot.com",
  messagingSenderId: "741670264244",
  appId: "1:741670264244:web:29dbc1d9900b843e00e6e1"
};

if (!firebaseConfig.projectId) {
  console.warn("Config Firebase vacía. Agrega tus credenciales en firebase.js");
}

export const app = initializeApp(firebaseConfig);
console.log("Firebase inicializada:", firebaseConfig.projectId);
export const db = getFirestore(app);
console.log("Firestore lista.", db.app.options.projectId);

// Re-export utilidades para uso en app.js
export { collection, addDoc, getDocs, query, orderBy, serverTimestamp };