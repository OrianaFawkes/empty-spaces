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

  if (element && value !== undefined) {
    element.textContent = value;
  }
}

function setLink(selector, label, href) {
  const element = document.querySelector(selector);

  if (!element) return;

  element.textContent = label;
  element.href = href;
}

function renderSiteContent(data) {
  setText('[data-site="hero.eyebrow"]', data.hero.eyebrow);
  setText('[data-site="hero.title"]', data.hero.title);
  setText('[data-site="hero.description"]', data.hero.description);

  setLink(
    '[data-site="hero.primaryAction"]',
    data.hero.primaryAction.label,
    data.hero.primaryAction.href,
  );

  setLink(
    '[data-site="hero.secondaryAction"]',
    data.hero.secondaryAction.label,
    data.hero.secondaryAction.href,
  );

  setText('[data-site="about.eyebrow"]', data.about.eyebrow);
  setText('[data-site="about.title"]', data.about.title);
  setText('[data-site="about.intro"]', data.about.intro);

  const aboutContainer = document.querySelector("[data-about-paragraphs]");

  if (aboutContainer) {
    aboutContainer.replaceChildren();

    data.about.paragraphs.forEach((paragraph) => {
      const element = document.createElement("p");
      element.textContent = paragraph;
      aboutContainer.append(element);
    });
  }

  setText('[data-site="contact.eyebrow"]', data.contact.eyebrow);
  setText('[data-site="contact.title"]', data.contact.title);
  setText('[data-site="contact.description"]', data.contact.description);

  setLink(
    '[data-site="contact.email"]',
    data.contact.buttonLabel,
    `mailto:${data.contact.email}`,
  );

  setText(".site-footer p:first-child", data.footer.message);
}

function renderProjects(projects) {
  const container = document.querySelector("#project-grid");

  if (!container) return;

  container.replaceChildren();

  projects.forEach((project) => {
    const article = document.createElement("article");
    article.className = "project-card";

    const visual = document.createElement("div");
    visual.className = "project-card-visual";

    if (project.image) {
      const image = document.createElement("img");
      image.src = project.image;
      image.alt = `${project.title} preview`;
      visual.append(image);
    } else {
      const number = document.createElement("span");
      number.textContent = String(projects.indexOf(project) + 1).padStart(
        2,
        "0",
      );
      visual.append(number);
    }

    const content = document.createElement("div");
    content.className = "project-card-content";

    const category = document.createElement("p");
    category.className = "project-category";
    category.textContent = project.category;

    const title = document.createElement("h3");
    title.textContent = project.title;

    const description = document.createElement("p");
    description.textContent = project.description;

    const tags = document.createElement("div");
    tags.className = "project-tags";

    project.technologies.forEach((technology) => {
      const tag = document.createElement("span");
      tag.textContent = technology;
      tags.append(tag);
    });

    content.append(category, title, description, tags);
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

    container.append(link);
  });
}

export async function loadContent() {
  try {
    const [site, projects, socials] = await Promise.all([
      loadJSON("site.json"),
      loadJSON("projects.json"),
      loadJSON("socials.json"),
    ]);

    renderSiteContent(site);
    renderProjects(projects);
    renderSocials(socials);
  } catch (error) {
    console.error("Unable to load website content:", error);

    const projectGrid = document.querySelector("#project-grid");

    if (projectGrid) {
      projectGrid.textContent =
        "Some content couldn't be loaded. Please try refreshing.";
    }
  }
}
