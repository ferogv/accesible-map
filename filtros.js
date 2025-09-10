// filtros.js
let onChangeRef = () => {};
const formId = "filtersForm";

export function initFilters(onChange) {
  onChangeRef = typeof onChange === "function" ? onChange : () => {};
  const form = document.getElementById(formId);
  const q = document.getElementById("q");
  const clearBtn = document.getElementById("clearFilters");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      onChangeRef(getFilters());
    });
  }
  if (q) {
    q.addEventListener("input", debounce(() => onChangeRef(getFilters()), 250));
  }
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (form) form.reset();
      onChangeRef(getFilters());
    });
  }
}

export function getFilters() {
  const category = (document.getElementById("category")?.value || "").trim();
  const features = Array.from(document.querySelectorAll('input[name="features"]:checked'))
    .map(i => i.value);
  const q = (document.getElementById("q")?.value || "").trim();
  return { category, features, q };
}

function debounce(fn, ms){
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}