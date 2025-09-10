// app.js
import {
  db, collection, addDoc, getDocs, query, orderBy, serverTimestamp
} from "./firebase.js";
import { renderDetail, clearDetail } from "./detalle.js";
import { updateStats } from "./estadisticas.js";
import { initFilters, getFilters } from "./filtros.js";

let map, markersLayer;
const state = { allSpaces: [], filtered: [], selected: null };

document.addEventListener("DOMContentLoaded", () => {
  initMap();
  wireRegistrarModal();
  initFilters(applyFilters);
  loadSpaces().then(() => {
    applyFilters(getFilters());
  }).catch(err => console.error(err));
});

function initMap() {
  map = L.map("map").setView([21.1619, -86.8515], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);

  map.on("click", (e) => {
    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);
    document.getElementById("lat").value = lat;
    document.getElementById("lng").value = lng;
  });
}

async function loadSpaces() {
  const q = query(collection(db, "spaces"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  const rows = [];
  snap.forEach(doc => {
    const d = doc.data();
    rows.push({
      id: doc.id,
      name: d.name,
      address: d.address || null,
      category: d.category,
      coords: d.coords,
      features: d.features || {},
      images: Array.isArray(d.images) ? d.images : [],
      createdAt: d.createdAt?.toMillis ? d.createdAt.toMillis() : null,
    });
  });
  state.allSpaces = rows;
}

function applyFilters(filters) {
  const { category, features, q } = filters || getFilters();
  const term = normalize(q);
  let data = [...state.allSpaces];
  if (category) data = data.filter(s => s.category === category);
  if (features.length) {
    data = data.filter(s => features.every(f => s.features?.[f]));
  }
  if (term) {
    data = data.filter(s => {
      const hay = normalize(`${s.name} ${s.address || ""}`);
      return hay.includes(term);
    });
  }
  state.filtered = data;
  renderMarkers(data);
  updateStats(data);
  if (state.selected && !data.find(s => s.id === state.selected.id)) {
    state.selected = null;
    clearDetail();
  }
}

function renderMarkers(spaces) {
  markersLayer.clearLayers();
  spaces.forEach(s => {
    const marker = L.marker([s.coords.lat, s.coords.lng], {
      icon: L.divIcon({ className: "custom-marker", html: "📍", iconSize: [24,24], iconAnchor: [12,24] })
    });
    marker.on("click", () => {
      state.selected = s;
      renderDetail(s);
      marker.openPopup();
    });
    marker.bindPopup(`<strong>${escapeHtml(s.name)}</strong><br/>${escapeHtml(s.address||"")}`);
    markersLayer.addLayer(marker);
  });
}

function wireRegistrarModal() {
  const openBtn = document.getElementById("openRegistrar");
  const closeBtn = document.getElementById("closeRegistrar");
  const modal = document.getElementById("registrarModal");
  const form = document.getElementById("createForm");
  const msg  = document.getElementById("formMsg");

  // Función para cerrar, resetear y devolver foco
  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
    form.reset();
    if (msg) msg.textContent = "";
    openBtn.focus();
  }

  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    modal.setAttribute("aria-hidden", "false");
    document.getElementById("name").focus();
  });

  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  form.addEventListener("submit", handleCreate);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const payload = serializeCreateForm();
      console.log("Intentando guardar en Firestore:", payload);
      const docRef = await addDoc(collection(db, "spaces"), {
        ...payload,
        createdAt: serverTimestamp(),
      });
      console.log("Documento guardado con ID:", docRef.id);

      // Cerrar el modal tras guardar
      closeModal();

      // Añadir optimísticamente al estado y re-render
      state.allSpaces.unshift({ id: docRef.id, ...payload });
      applyFilters(getFilters());
    } catch (err) {
      console.error("Error en handleCreate:", err);
      if (msg) {
        msg.textContent = err.message || "Error al guardar";
        msg.style.color = "crimson";
      }
    }
  }
}

function serializeCreateForm() {
  const name  = document.getElementById("name").value.trim();
  const address = document.getElementById("address").value.trim();
  const lat   = parseFloat(document.getElementById("lat").value);
  const lng   = parseFloat(document.getElementById("lng").value);
  const category = document.getElementById("categoryCreate").value;
  const rampa      = document.querySelector('input[name="rampa"]').checked;
  const bano       = document.querySelector('input[name="bano"]').checked;
  const senial     = document.querySelector('input[name="senializacion"]').checked;
  const estacion   = document.querySelector('input[name="estacionamiento"]').checked;
  const imagesRaw  = document.getElementById("images").value.trim();
  const images     = imagesRaw ? imagesRaw.split(",").map(s=>s.trim()).filter(Boolean) : [];

  if (!name || isNaN(lat) || isNaN(lng)) {
    throw new Error("Nombre, latitud y longitud son obligatorios.");
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new Error("Coordenadas fuera de rango.");
  }

  return { name, address: address||null, category,
    coords: { lat, lng },
    features: { rampa, bano, senializacion: senial, estacionamiento: estacion },
    images, createdAt: null
  };
}

function normalize(s) {
  return String(s||"").toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").trim();
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}