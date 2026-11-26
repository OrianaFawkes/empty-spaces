import { loadContent } from "./content.js";

async function initializeSite() {
  try {
    await loadContent();

    // Wait for fonts before revealing the page.
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
