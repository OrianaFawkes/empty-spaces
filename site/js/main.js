import { ENVIRONMENTS } from "./config/environments.js";

import { createPostProcessing } from "./effects/postProcessing.js";

import { createRenderer, resizeRenderer } from "./three/renderer.js";
import { createEnvironmentScene } from "./three/scene.js";
import { createEnvironmentLoader } from "./three/environmentLoader.js";
import { createCameraController } from "./three/cameraController.js";
import { createAnimationLoop } from "./three/animation.js";

import { loadContent } from "./content.js";

const container = document.querySelector("#background");
const loadingMessage = document.querySelector("#loading-message");
const loadingProgress = document.querySelector("#loading-progress");

if (!container) {
  throw new Error('Missing required background container: "#background"');
}

const activeEnvironment = ENVIRONMENTS.home;

const renderer = createRenderer(container);

const { scene, camera, environmentRoot } =
  createEnvironmentScene(activeEnvironment);

const environmentLoader = createEnvironmentLoader(environmentRoot);

const cameraController = createCameraController(
  camera,
  activeEnvironment.camera,
);

const postProcessing = createPostProcessing();

function setLoadingMessage(message) {
  if (loadingMessage) {
    loadingMessage.textContent = message;
  }
}

function setLoadingProgress(progress) {
  if (!loadingProgress || progress === null) return;

  loadingProgress.style.width = `${progress}%`;
}

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const drawingBufferSize = resizeRenderer(renderer, width, height);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  postProcessing.resize(drawingBufferSize);
}

window.addEventListener("resize", resize);
resize();

const animationLoop = createAnimationLoop({
  renderer,
  scene,
  camera,
  cameraController,
  postProcessing,
});

function loadBackground() {
  setLoadingMessage("Loading the environment...");

  return environmentLoader
    .load(activeEnvironment, ({ progress }) => {
      if (progress !== null) {
        setLoadingProgress(progress);
      }
    })
    .then(() => {
      setLoadingProgress(100);
      animationLoop.start();

      return true;
    })
    .catch((error) => {
      console.error("Background initialization failed:", error);

      container.classList.add("model-load-failed");
      setLoadingMessage("The environment could not be loaded.");

      return false;
    });
}

function updateCopyrightYear() {
  const yearElement = document.querySelector("#current-year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

async function initializeSite() {
  updateCopyrightYear();

  // Load the 3D environment and content concurrently.
  const backgroundPromise = loadBackground();

  setLoadingMessage("Preparing the content...");

  await loadContent();

  // Wait for web fonts before processing character positions.
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  setLoadingMessage("Finishing up...");

  await backgroundPromise;

  document.body.classList.add("is-ready");
}

initializeSite().catch((error) => {
  console.error("Unable to initialize the website:", error);

  document.body.classList.add("is-ready");
  setLoadingMessage("Some elements could not be initialized.");
});

export const backgroundSystem = {
  renderer,
  scene,
  camera,
  environmentLoader,
  cameraController,
  postProcessing,
  animationLoop,

  dispose() {
    window.removeEventListener("resize", resize);

    animationLoop.stop();
    environmentLoader.dispose();
    cameraController.dispose();
    postProcessing.dispose();
    renderer.dispose();
  },
};
