export function initializeCharacter() {
  const hero = document.querySelector("#home");
  const character = hero?.querySelector(".hero-character-sprite");

  if (!hero || !character) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");

  if (reducedMotion.matches || !finePointer.matches) return;

  let frame = null;

  function updatePosition(event) {
    if (frame !== null) {
      cancelAnimationFrame(frame);
    }

    frame = requestAnimationFrame(() => {
      const bounds = hero.getBoundingClientRect();

      const normalizedX =
        ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;

      const normalizedY =
        ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;

      const x = Math.max(-1, Math.min(1, normalizedX));
      const y = Math.max(-1, Math.min(1, normalizedY));

      const movementX = x * 12;
      const movementY = y * 8;
      const rotation = x * 0.35;

      character.style.setProperty("--character-x", `${movementX}px`);
      character.style.setProperty("--character-y", `${movementY}px`);
      character.style.setProperty("--character-rotation", `${rotation}deg`);

      frame = null;
    });
  }

  function resetPosition() {
    if (frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
    }

    character.style.setProperty("--character-x", "0px");
    character.style.setProperty("--character-y", "0px");
    character.style.setProperty("--character-rotation", "0deg");
  }

  hero.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch") return;
    updatePosition(event);
  });

  hero.addEventListener("pointerleave", resetPosition);
}
