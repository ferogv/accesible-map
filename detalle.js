// detalle.js
const root = document.getElementById("detalle");

import { getAccessories, addAccessory, removeAccessory } from "./accesorios.js";

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

export async function renderDetail(space) {
  if (!space) return clearDetail();

  const root = getRoot();
  if (!root) return;

  const accessories = await getAccessories(space.id);
  console.log("Accesorios:", accessories);

  const accList = accessories.map(a => `
    <li>
      ${a.name} (x${a.quantity})
      <button data-del="${a.id}">Eliminar</button>
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
    <form id="addAccForm">
      <input type="text" id="accName" placeholder="Accesorio" required />
      <input type="number" id="accQty" value="1" min="1" />
      <button type="submit">Agregar</button>
    </form>
  `;

  // Wire eliminar
  root.querySelectorAll("button[data-del]").forEach(btn => {
    btn.addEventListener("click", async () => {
      await removeAccessory(space.id, btn.dataset.del);
      renderDetail(space); // recargar
    });
  });

  // Wire agregar
  const form = root.querySelector("#addAccForm");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const name = document.getElementById("accName").value.trim();
    const qty = parseInt(document.getElementById("accQty").value, 10);
    await addAccessory(space.id, name, qty);
    renderDetail(space); // recargar
  });
}