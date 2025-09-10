# Mapa Colaborativo de Espacios Accesibles (MVP)

Interfaz estática con HTML/CSS/JS, Leaflet y Firestore (lectura/escritura directa), CI/CD con GitHub Pages.

## Requisitos
- Cuenta Firebase con Firestore habilitado (modo producción, colección `spaces`).
- Configuración Web App de Firebase (config pública).

## Configuración
1. Crea un proyecto en Firebase y habilita Firestore.
2. En `firebase.js`, pega la config de tu app:
   ```js
   export const firebaseConfig = {
     apiKey: "xxx",
     authDomain: "xxx.firebaseapp.com",
     projectId: "xxx",
     storageBucket: "xxx.appspot.com",
     messagingSenderId: "xxx",
     appId: "1:xxx:web:xxx",
   };