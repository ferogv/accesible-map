// detalle.js
const root = document.getElementById("detalle");

export function renderDetail(space) {
  if (!root) return;
  if (!space) return clearDetail();

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
  `;
}

export function clearDetail() {
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