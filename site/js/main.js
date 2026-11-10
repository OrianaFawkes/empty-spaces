import { loadContent } from "./content.js";

function updateCopyrightYear() {
  const yearElement = document.querySelector("#current-year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

async function initializeSite() {
  updateCopyrightYear();

  await loadContent();
}

initializeSite();
