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

  const face = createElement(
    "div",
    `dossier-card-face dossier-card-${faceName}`,
  );

  const header = createElement("div", "dossier-card-header");
  header.append(
    createElement("span", "", card.institution),
    createElement("span", "", card.classification),
  );

  const identity = createElement("div", "dossier-card-identity");

  identity.append(
    createElement("p", "dossier-card-role", card.role),
    createElement("h3", "dossier-card-name", card.name),
    createElement("p", "dossier-card-id", card.id),
  );

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

  face.append(header, identity, details, footer);

  return face;
}

function renderSupportingPanel(data, side) {
  const panelData = data[side];

  const panel = createElement("div", `dossier-support dossier-support-${side}`);

  panel.append(
    createElement("p", "dossier-eyebrow", panelData.eyebrow),
    createElement("h3", "dossier-support-title", panelData.title),
  );

  if (side === "left") {
    panelData.paragraphs.forEach((paragraph) => {
      panel.append(createElement("p", "dossier-paragraph", paragraph));
    });
  } else {
    const list = createElement("dl", "dossier-facts");

    panelData.items.forEach((item) => {
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

function renderSupportingContent(leftContainer, rightContainer, profile) {
  leftContainer.replaceChildren(renderSupportingPanel(profile, "left"));

  rightContainer.replaceChildren(renderSupportingPanel(profile, "right"));
}

export function renderPersonnelDossier(data) {
  const container = document.querySelector("#personnel-dossier");

  if (!container) return;

  const fictional = data.fictional;
  const personal = data.personal;

  if (!fictional || !personal) {
    throw new Error(
      "Personnel data must include fictional and personal profiles.",
    );
  }

  let showingPersonal = false;

  const dossier = createElement("div", "dossier-layout");

  const leftSupport = createElement("div", "dossier-left-support");
  const rightSupport = createElement("div", "dossier-right-support");

  const cardArea = createElement("div", "dossier-card-area");

  const flipButton = createElement("button", "dossier-flip-button");

  flipButton.type = "button";
  flipButton.setAttribute("aria-label", "Flip identity card");
  flipButton.setAttribute("aria-pressed", "false");

  const card = createElement("div", "dossier-card");

  card.append(
    renderCardFace(fictional, "front"),
    renderCardFace(personal, "back"),
  );

  cardArea.append(card);

  const flipHint = createElement(
    "p",
    "dossier-flip-hint",
    "SELECT TO REVEAL OTHER IDENTITY",
  );

  cardArea.append(flipButton, flipHint);

  function updateProfile() {
    const profile = showingPersonal ? personal : fictional;

    dossier.classList.toggle("is-flipped", showingPersonal);

    flipButton.setAttribute("aria-pressed", String(showingPersonal));

    flipButton.setAttribute(
      "aria-label",
      showingPersonal
        ? "Show fictional identity: Oriana Fawkes"
        : "Show developer identity: Ori",
    );

    flipHint.textContent = showingPersonal
      ? "VIEW RESEARCHER RECORD"
      : "VIEW DEVELOPER PROFILE";

    renderSupportingContent(leftSupport, rightSupport, profile);
  }

  flipButton.addEventListener("click", () => {
    showingPersonal = !showingPersonal;
    updateProfile();
  });

  dossier.append(leftSupport, rightSupport, cardArea);

  container.replaceChildren(dossier);

  updateProfile();
}
