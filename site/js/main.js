import { ENVIRONMENTS } from "./config/environments.js";

import { createForegroundLens } from "./effects/foregroundLens.js";
import { createPostProcessing } from "./effects/postProcessing.js";

import { createRenderer, resizeRenderer } from "./three/renderer.js";
import { createEnvironmentScene } from "./three/scene.js";
import { createEnvironmentLoader } from "./three/environmentLoader.js";
import { createCameraController } from "./three/cameraController.js";
import { createAnimationLoop } from "./three/animation.js";

import { loadContent } from "./content.js";

const container = document.querySelector("#background");

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
const foregroundLens = createForegroundLens();

foregroundLens.init();

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const drawingBufferSize = resizeRenderer(renderer, width, height);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  postProcessing.resize(drawingBufferSize);
  foregroundLens.update();
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

environmentLoader
  .load(activeEnvironment)
  .then(() => {
    animationLoop.start();
  })
  .catch(() => {
    container.classList.add("model-load-failed");
  });

export const backgroundSystem = {
  renderer,
  scene,
  camera,
  environmentLoader,
  cameraController,
  postProcessing,
  foregroundLens,
  animationLoop,

  dispose() {
    animationLoop.stop();
    environmentLoader.dispose();
    cameraController.dispose();
    foregroundLens.dispose();
    postProcessing.dispose();
    renderer.dispose();
  },
};

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
