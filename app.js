// app.js
import {
  db, collection, addDoc, getDocs, query, orderBy, serverTimestamp
} from "./firebase.js";

let map, markersLayer;
let state = {
  allSpaces: [],
  filters: { category: "", features: [] }
};

function initMap() {
  map = L.map("map").setView([21.1619, -86.8515], 12); // Cancún por default
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);

  // Click para tomar coordenadas en el formulario
  map.on("click", (e) => {
    const lat = e.latlng.lat.toFixed(6);
    const lng = e.latlng.lng.toFixed(6);
    document.getElementById("lat").value = lat;
    document.getElementById("lng").value = lng;
  });
}

function spaceToMarker(space) {
  const { name, coords, address, category, features } = space;
  const icon = L.divIcon({
    className: "custom-marker",
    html: "📍",
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
  const marker = L.marker([coords.lat, coords.lng], { icon });
  const lines = [];
  lines.push(`<strong>${name}</strong>`);
  if (address) lines.push(`${address}`);
  lines.push(`Categoría: ${category}`);
  const feats = Object.entries(features || {})
    .filter(([, v]) => !!v)
    .map(([k]) => k)
    .join(", ");
  lines.push(`Características: ${feats || "—"}`);
  marker.bindPopup(lines.join("<br/>"));
  return marker;
}

function renderList(spaces) {
  const ul = document.getElementById("results");
  ul.innerHTML = "";
  spaces.forEach(s => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${s.name}</strong><br/>
        <small>${s.category}${s.address ? " • " + s.address : ""}</small>
      </div>
      <button class="btn btn--ghost" data-lat="${s.coords.lat}" data-lng="${s.coords.lng}">Ver</button>
    `;
    ul.appendChild(li);
  });
  ul.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      const lat = parseFloat(btn.dataset.lat);
      const lng = parseFloat(btn.dataset.lng);
      map.setView([lat, lng], 16);
    });
  });
}

function renderMarkers(spaces) {
  markersLayer.clearLayers();
  spaces.forEach(s => markersLayer.addLayer(spaceToMarker(s)));
}

function renderStats(spaces) {
  const total = spaces.length;
  const count = (key) => spaces.filter(s => s.features?.[key]).length;
  document.getElementById("statTotal").textContent = total;
  document.getElementById("statRampa").textContent = count("rampa");
  document.getElementById("statBano").textContent = count("bano");
  document.getElementById("statSenializacion").textContent = count("senializacion");
  document.getElementById("statEst").textContent = count("estacionamiento");
}

function applyFilters() {
  const { category, features } = state.filters;
  let filtered = [...state.allSpaces];
  if (category) filtered = filtered.filter(s => s.category === category);
  if (features.length) {
    filtered = filtered.filter(s =>
      features.every(f => s.features?.[f])
    );
  }
  renderMarkers(filtered);
  renderList(filtered);
  renderStats(filtered);
}

function readFiltersForm() {
  const category = document.getElementById("category").value;
  const features = Array.from(document.querySelectorAll('input[name="features"]:checked'))
    .map(i => i.value);
  state.filters = { category, features };
}

function wireFilters() {
  document.getElementById("filtersForm").addEventListener("submit", (e) => {
    e.preventDefault();
    readFiltersForm();
    applyFilters();
  });
  document.getElementById("clearFilters").addEventListener("click", () => {
    document.getElementById("category").value = "";
    document.querySelectorAll('input[name="features"]').forEach(i => i.checked = false);
    readFiltersForm();
    applyFilters();
  });
}

function serializeCreateForm() {
  const name = document.getElementById("name").value.trim();
  const address = document.getElementById("address").value.trim();
  const lat = parseFloat(document.getElementById("lat").value);
  const lng = parseFloat(document.getElementById("lng").value);
  const category = document.getElementById("categoryCreate").value;
  const rampa = document.querySelector('input[name="rampa"]').checked;
  const bano = document.querySelector('input[name="bano"]').checked;
  const senializacion = document.querySelector('input[name="senializacion"]').checked;
  const estacionamiento = document.querySelector('input[name="estacionamiento"]').checked;
  const imagesRaw = document.getElementById("images").value.trim();
  const images = imagesRaw ? imagesRaw.split(",").map(s => s.trim()).filter(Boolean) : [];

  // Validación básica
  if (!name || isNaN(lat) || isNaN(lng)) {
    throw new Error("Nombre, latitud y longitud son obligatorios.");
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new Error("Coordenadas fuera de rango.");
  }

  return {
    name,
    address: address || null,
    category,
    coords: { lat, lng },
    features: { rampa, bano, senializacion, estacionamiento },
    images,
    createdAt: null, // serverTimestamp se asigna en escritura
  };
}

async function handleCreate(e) {
  e.preventDefault();
  const msg = document.getElementById("formMsg");
  try {
    const payload = serializeCreateForm();
    const docRef = await addDoc(collection(db, "spaces"), {
      ...payload,
      createdAt: serverTimestamp(),
    });
    msg.textContent = "Guardado ✔️";
    msg.style.color = "green";
    // Añadir al estado y re-render
    state.allSpaces.push({ id: docRef.id, ...payload });
    applyFilters();
    e.target.reset();
  } catch (err) {
    console.error(err);
    msg.textContent = err.message || "Error al guardar";
    msg.style.color = "crimson";
  }
}

function wireCreateForm() {
  document.getElementById("createForm").addEventListener("submit", handleCreate);
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
  applyFilters();
}

function init() {
  initMap();
  wireFilters();
  wireCreateForm();
  readFiltersForm();
  loadSpaces().catch(err => console.error("Error loading spaces:", err));
}

document.addEventListener("DOMContentLoaded", init);