import * as THREE from "three";
import { RENDER_CONFIG } from "../config/renderConfig.js";

export function createRenderer(container) {
  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
  } catch (error) {
    console.error("WebGL is unavailable:", error);
    container.classList.add("webgl-unavailable");
    throw error;
  }

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, RENDER_CONFIG.pixelRatio),
  );
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setClearColor(RENDER_CONFIG.clearColor, 1);

  container.appendChild(renderer.domElement);

  return renderer;
}

export function resizeRenderer(renderer, width, height) {
  const pixelRatio = Math.min(
    window.devicePixelRatio || 1,
    width < RENDER_CONFIG.mobileBreakpoint
      ? RENDER_CONFIG.mobilePixelRatio
      : RENDER_CONFIG.pixelRatio,
  );

  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(width, height);

  const drawingBufferSize = new THREE.Vector2();
  renderer.getDrawingBufferSize(drawingBufferSize);

  return drawingBufferSize;
}
