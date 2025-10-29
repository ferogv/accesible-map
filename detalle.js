// detalle.js
import { getAccessories } from "./accesorios.js";

const getRoot = () => document.getElementById("detalle");

export function clearDetail() {
  const root = getRoot();
  if (!root) return;
  root.innerHTML = `
    <h2>Detalle del espacio</h2>
    <p class="muted">Selecciona un marcador en el mapa para ver el detalle aquí.</p>
  `;
}

function labelFeature(key){
  const map = {
    rampa: "Rampa",
    bano: "Baño adaptado",
    senializacion: "Señalización",
    estacionamiento: "Estacionamiento"
  };
  return map[key] || key;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function renderDetail(space) {
  if (!space) return clearDetail();
  const root = getRoot();
  if (!root) return;

  let accessories = [];
  try {
    accessories = await getAccessories(space.id);
  } catch (err) {
    console.error("Error al obtener accesorios:", err);
    root.innerHTML = `<div class="muted">Error cargando detalle: ${escapeHtml(err.message||String(err))}</div>`;
    return;
  }

  console.log("Accesorios:", accessories);

  const accList = accessories.map(a => `
    <li>
      ${a.name} (x${a.quantity})
    </li>
  `).join("");

  const feats = Object.entries(space.features || {})
    .filter(([, v]) => !!v)
    .map(([k]) => labelFeature(k))
    .join(", ") || "—";

  const imgs = (space.images || []).slice(0, 4).map(url => {
    const safe = String(url);
    return `<img src="${safe}" alt="Imagen de ${escapeHtml(space.name)}" loading="lazy" />`;
  }).join("");

    root.innerHTML = `
      <h2>${escapeHtml(space.name)}</h2>
      <p class="muted">${escapeHtml(space.address || "Sin dirección")}</p>
      <p><strong>Categoría:</strong> ${escapeHtml(space.category)}</p>
      <p><strong>Características:</strong> ${feats}</p>
      <p><strong>Coordenadas:</strong> ${space.coords.lat}, ${space.coords.lng}</p>
      ${imgs ? `<div class="gallery">${imgs}</div>` : ""}
      <p><strong>Accesorios:</strong></p>
      <ul>${accList || "<li>Sin accesorios</li>"}</ul>
    `;
  }
