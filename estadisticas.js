// estadisticas.js
export function updateStats(spaces) {
  const total = spaces.length;
  const count = (key) => spaces.filter(s => s.features?.[key]).length;
  setText("statTotal", total);
  setText("statRampa", count("rampa"));
  setText("statBano", count("bano"));
  setText("statSenializacion", count("senializacion"));
  setText("statEst", count("estacionamiento"));
}

function setText(id, val){
  const el = document.getElementById(id);
  if (el) el.textContent = String(val);
}