import { generateRandomArt } from "../effects/randomArt.js";

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

function renderCardFace(profile, faceName) {
  const card = profile.card;

  const hole = createElement("div", "dossier-card-hole");

  hole.setAttribute("aria-hidden", "true");

  const face = createElement(
    "div",
    `dossier-card-face dossier-card-${faceName}`,
  );

  face.setAttribute("aria-hidden", "true");

  const header = createElement("div", "dossier-card-header");

  header.append(
    createElement("span", "dossier-card-institution", card.institution),
    createElement("span", "dossier-card-classification", card.classification),
  );

  const identity = createElement("div", "dossier-card-identity");

  identity.append(
    createElement("p", "dossier-card-role", card.role),
    createElement("h3", "dossier-card-name", card.name),
    createElement("p", "dossier-card-id", card.id),
  );

  const main = createElement("div", "dossier-card-main");

  let portrait = null;

  if (faceName === "back") {
    portrait = createElement("img", "dossier-card-portrait");

    portrait.src = "assets/images/ori.png";
    portrait.alt = "";
    portrait.setAttribute("aria-hidden", "true");
    portrait.draggable = false;
  }

  main.append(identity);

  if (faceName === "front") {
    const randomArt = createElement("pre", "dossier-card-randomart");

    randomArt.setAttribute("aria-hidden", "true");

    main.append(randomArt);
  }

  const details = createElement("dl", "dossier-card-details");

  [
    ["DIVISION", card.department],
    ["STATUS", card.status],
    ["CLEARANCE", card.clearance],
  ].forEach(([label, value]) => {
    const group = createElement("div", "dossier-card-detail");

    group.append(
      createElement("dt", "", label),
      createElement("dd", "", value),
    );

    details.append(group);
  });

  const footer = createElement("div", "dossier-card-footer");

  footer.append(
    createElement("span", "dossier-card-barcode", card.barcode),
    createElement("span", "dossier-card-marking", "ES / ARI"),
  );

  const faceChildren = [hole];

  if (portrait) {
    faceChildren.push(portrait);
  }

  faceChildren.push(header, main, details, footer);

  face.append(...faceChildren);

  return face;
}

function renderSupportingPanel(data, side, animate = false) {
  const panel = createElement("div", `dossier-support dossier-support-${side}`);

  if (animate) {
    panel.classList.add("dossier-support-entering");
  }

  panel.append(
    createElement("p", "dossier-eyebrow", data.eyebrow),
    createElement("h3", "dossier-support-title", data.title),
  );

  if (side === "left") {
    (data.paragraphs ?? []).forEach((paragraph) => {
      panel.append(createElement("p", "dossier-paragraph", paragraph));
    });
  } else {
    const list = createElement("dl", "dossier-facts");

    (data.items ?? []).forEach((item) => {
      const group = createElement("div", "dossier-fact");

      group.append(
        createElement("dt", "", item.label),
        createElement("dd", "", item.value),
      );

      list.append(group);
    });

    panel.append(list);
  }

  return panel;
}

function renderSupportingContent(
  leftContainer,
  rightContainer,
  profile,
  animate = false,
) {
  leftContainer.replaceChildren(
    renderSupportingPanel(profile.left, "left", animate),
  );

  rightContainer.replaceChildren(
    renderSupportingPanel(profile.right, "right", animate),
  );
}

export function renderPersonnelDossier(data) {
  const container = document.querySelector("#personnel-dossier");

  if (!container) return;

  const fictional = data.fictional;
  const personal = data.personal;

  if (!fictional?.card || !personal?.card) {
    throw new Error(
      "Personnel data must include fictional and personal profiles.",
    );
  }

  let showingPersonal = false;

  const dossier = createElement("div", "dossier-layout");

  const leftSupport = createElement("div", "dossier-left-support");
  const rightSupport = createElement("div", "dossier-right-support");

  const cardArea = createElement("div", "dossier-card-area");

  const flipButton = createElement("button", "dossier-card-toggle");

  flipButton.type = "button";
  flipButton.setAttribute("aria-pressed", "false");
  flipButton.setAttribute("aria-label", "Show developer identity");
  flipButton.setAttribute("aria-describedby", "dossier-flip-hint");

  const cardMotion = createElement("div", "dossier-card-motion");
  const cardTilt = createElement("div", "dossier-card-tilt");
  const card = createElement("div", "dossier-card");

  const frontFace = renderCardFace(fictional, "front");
  const backFace = renderCardFace(personal, "back");

  const randomArtElement = frontFace.querySelector(".dossier-card-randomart");

  const randomArtSeed = [
    fictional.card.institution,
    fictional.card.name,
    fictional.card.id,
    fictional.card.department,
  ].join("|");

  generateRandomArt(randomArtSeed)
    .then((art) => {
      if (randomArtElement) {
        randomArtElement.textContent = art;
      }
    })
    .catch((error) => {
      console.error("Unable to generate personnel Randomart:", error);
    });

  card.append(frontFace, backFace);
  cardTilt.append(card);
  cardMotion.append(cardTilt);
  flipButton.append(cardMotion);

  const flipHint = createElement(
    "p",
    "dossier-flip-hint",
    "SELECT CARD TO REVEAL OTHER IDENTITY",
  );

  flipHint.id = "dossier-flip-hint";

  function updateProfile(animate = false) {
    const profile = showingPersonal ? personal : fictional;

    card.classList.toggle("is-flipped", showingPersonal);

    flipButton.setAttribute("aria-pressed", String(showingPersonal));

    flipButton.setAttribute(
      "aria-label",
      showingPersonal
        ? "Show fictional identity: Oriana Fawkes"
        : "Show developer identity: Ori",
    );

    frontFace.setAttribute("aria-hidden", String(showingPersonal));
    backFace.setAttribute("aria-hidden", String(!showingPersonal));

    frontFace.inert = showingPersonal;
    backFace.inert = !showingPersonal;

    flipHint.textContent = showingPersonal
      ? "VIEW RESEARCHER RECORD"
      : "VIEW DEVELOPER PROFILE";

    renderSupportingContent(leftSupport, rightSupport, profile, animate);
  }

  flipButton.addEventListener("click", () => {
    showingPersonal = !showingPersonal;
    updateProfile(true);
  });

  const finePointer = window.matchMedia("(pointer: fine)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function resetCardTilt() {
    cardTilt.style.setProperty("--tilt-x", "0deg");
    cardTilt.style.setProperty("--tilt-y", "0deg");
  }

  if (finePointer.matches && !reducedMotion.matches) {
    flipButton.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;

      const bounds = flipButton.getBoundingClientRect();

      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;

      const normalizedX = (x - 0.5) * 2;
      const normalizedY = (y - 0.5) * 2;

      const rotateX = -normalizedY * 5;
      const rotateY = normalizedX * 6;

      cardTilt.style.setProperty("--tilt-x", `${rotateX}deg`);
      cardTilt.style.setProperty("--tilt-y", `${rotateY}deg`);
    });

    flipButton.addEventListener("pointerleave", resetCardTilt);
  }

  cardArea.append(flipButton, flipHint);

  dossier.append(leftSupport, cardArea, rightSupport);

  container.replaceChildren(dossier);

  updateProfile();
}
