import { renderPersonnelDossier } from "./components/personnelDossier.js";
import { initFooterClock } from "./components/footerClock.js";

const DATA_PATH = "data/";

async function loadJSON(filename) {
  const response = await fetch(`${DATA_PATH}${filename}`);

  if (!response.ok) {
    throw new Error(`Failed to load ${filename}: ${response.status}`);
  }

  return response.json();
}

function setText(selector, value) {
  const element = document.querySelector(selector);

  if (element && value !== undefined && value !== null) {
    element.textContent = value;
  }
}

function setLink(selector, label, href) {
  const element = document.querySelector(selector);

  if (!element || !href) return;

  element.textContent = label;
  element.href = href;
}

function createExternalLink(label, href, className) {
  if (!href) return null;

  const link = document.createElement("a");

  link.className = className;
  link.href = href;
  link.textContent = label;
  link.target = "_blank";
  link.rel = "noopener noreferrer";

  return link;
}

function renderHeroActions(actions = []) {
  const container = document.querySelector("#hero-actions");

  if (!container) return;

  container.replaceChildren();

  actions.forEach((action) => {
    const link = document.createElement("a");

    link.href = action.href;
    link.textContent = action.label;

    if (action.style === "primary") {
      link.className = "button button-primary";
    } else if (action.style === "secondary") {
      link.className = "button button-secondary";
    } else {
      link.className = "hero-text-link";
    }

    container.append(link);
  });
}

function renderSiteContent(data) {
  setText('[data-site="hero.eyebrow"]', data.hero?.eyebrow);
  setText('[data-site="hero.title"]', data.hero?.title);
  setText('[data-site="hero.description"]', data.hero?.description);

  renderHeroActions(data.hero?.actions ?? []);

  setText('[data-site="contact.eyebrow"]', data.contact?.eyebrow);
  setText('[data-site="contact.title"]', data.contact?.title);
  setText('[data-site="contact.description"]', data.contact?.description);

  setLink(
    '[data-site="contact.email"]',
    data.contact?.buttonLabel,
    data.contact?.email ? `mailto:${data.contact.email}` : null,
  );

  setText('[data-site="footer.message"]', data.footer?.message);
}

function renderProjects(projects) {
  const container = document.querySelector("#project-grid");

  if (!container) return;

  container.replaceChildren();

  projects.forEach((project, index) => {
    const article = document.createElement("article");
    article.className = "project-card";
    article.dataset.project = project.id;

    const visual = document.createElement("div");
    visual.className = "project-card-visual";

    if (project.image) {
      const image = document.createElement("img");

      image.src = project.image;
      image.alt = `${project.title} preview`;
      image.loading = "lazy";
      image.decoding = "async";

      visual.append(image);
    } else {
      const number = document.createElement("span");

      number.textContent = project.entry ?? String(index + 1).padStart(3, "0");

      visual.append(number);
    }

    const content = document.createElement("div");
    content.className = "project-card-content";

    const metadata = document.createElement("div");
    metadata.className = "project-card-metadata";

    const category = document.createElement("p");
    category.className = "project-category";
    category.textContent = project.category;
    category.dataset.adaptiveContrast = "";

    const status = document.createElement("span");
    status.className = "project-status";
    status.textContent = project.status ?? "ARCHIVED";
    status.dataset.adaptiveContrast = "";

    metadata.append(category, status);

    const title = document.createElement("h3");
    title.textContent = project.title;
    title.dataset.adaptiveContrast = "";

    const description = document.createElement("p");
    description.textContent = project.description;
    description.dataset.adaptiveContrast = "";

    const tags = document.createElement("div");
    tags.className = "project-tags";

    (project.technologies ?? []).forEach((technology) => {
      const tag = document.createElement("span");

      tag.textContent = technology;
      tag.dataset.adaptiveContrast = "";

      tags.append(tag);
    });

    const links = document.createElement("div");
    links.className = "project-links";

    const demoLink = createExternalLink(
      "OPEN PROJECT",
      project.links?.demo,
      "project-link",
    );

    if (demoLink) {
      links.append(demoLink);
    }

    // Only public repositories with an actual URL are displayed.
    const sourceIsPublic = project.repositoryVisibility === "public";

    const sourceLink = sourceIsPublic
      ? createExternalLink(
          "SOURCE REPOSITORY",
          project.links?.source,
          "project-link project-source-link",
        )
      : null;

    if (sourceLink) {
      links.append(sourceLink);
    }

    content.append(metadata, title, description, tags);

    if (links.childElementCount > 0) {
      content.append(links);
    }

    article.append(visual, content);
    container.append(article);
  });
}

function renderSocials(socials) {
  const container = document.querySelector("#social-links");

  if (!container) return;

  container.replaceChildren();

  socials.forEach((social) => {
    const link = document.createElement("a");

    link.href = social.url;
    link.textContent = social.platform;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.dataset.adaptiveContrast = "";

    container.append(link);
  });
}

function renderSectionTracker(sections) {
  const container = document.querySelector("#section-tracker");

  if (!container) return;

  container.replaceChildren();

  sections.forEach((section) => {
    const link = document.createElement("a");

    link.href = `#${section.id}`;
    link.className = "section-tracker-link";
    link.dataset.section = section.id;
    link.setAttribute("aria-label", `${section.number}: ${section.label}`);

    const number = document.createElement("span");
    number.className = "section-tracker-number";
    number.textContent = `#${section.number}`;

    const label = document.createElement("span");
    label.className = "section-tracker-label";
    label.textContent = section.label;
    label.setAttribute("aria-hidden", "true");

    link.append(label, number);
    container.append(link);
  });

  observeSections(sections);
}

function observeSections(sections) {
  const links = document.querySelectorAll(".section-tracker-link");

  if (!("IntersectionObserver" in window)) {
    links[0]?.classList.add("is-active");
    links[0]?.setAttribute("aria-current", "location");
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (!visibleEntries.length) return;

      const activeId = visibleEntries[0].target.id;

      links.forEach((link) => {
        const isActive = link.dataset.section === activeId;

        link.classList.toggle("is-active", isActive);

        if (isActive) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    },
    {
      root: null,
      rootMargin: "-35% 0px -45% 0px",
      threshold: [0, 0.1, 0.25, 0.5, 0.75],
    },
  );

  sections.forEach((section) => {
    const element = document.getElementById(section.id);

    if (element) observer.observe(element);
  });
}

export async function loadContent() {
  try {
    const [site, projects, socials, navigation, personnel] = await Promise.all([
      loadJSON("site.json"),
      loadJSON("projects.json"),
      loadJSON("socials.json"),
      loadJSON("navigation.json"),
      loadJSON("personnel.json"),
    ]);

    renderSiteContent(site);
    renderPersonnelDossier(personnel);
    renderProjects(projects);
    renderSocials(socials);
    renderSectionTracker(navigation.sections);

    initFooterClock();

    return true;
  } catch (error) {
    console.error("Unable to load website content:", error);

    const projectGrid = document.querySelector("#project-grid");

    if (projectGrid) {
      projectGrid.textContent =
        "Some content couldn't be loaded. Please try refreshing.";
    }

    return false;
  }
}
