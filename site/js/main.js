import { loadContent } from "./content.js";
import { initializeCharacter } from "./character/characterController.js";

async function initializeSite() {
  try {
    await loadContent();

    initializeCharacter();

    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    document.body.classList.add("is-ready");
  } catch (error) {
    console.error("Unable to initialize the website:", error);
    document.body.classList.add("is-ready");
  }
}

initializeSite();
