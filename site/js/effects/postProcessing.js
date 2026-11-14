import * as THREE from "three";
import { EFFECTS_CONFIG } from "../config/effectsConfig.js";
import { vertexShader, fragmentShader } from "./postProcessingShader.js";

export function createPostProcessing() {
  const renderTarget = new THREE.WebGLRenderTarget(1, 1, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    depthBuffer: true,
    stencilBuffer: false,
  });

  renderTarget.texture.generateMipmaps = false;

  const postScene = new THREE.Scene();
  const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uScene: { value: renderTarget.texture },
    uResolution: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uFisheye: { value: EFFECTS_CONFIG.fisheye },
    uVignette: { value: EFFECTS_CONFIG.vignette },
    uBlur: { value: EFFECTS_CONFIG.blur },
    uChromatic: { value: EFFECTS_CONFIG.chromatic },
    uGrain: { value: EFFECTS_CONFIG.grain },
    uExposure: { value: EFFECTS_CONFIG.exposure },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    vertexShader,
    fragmentShader,
  });

  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  postScene.add(quad);

  function resize(drawingBufferSize) {
    renderTarget.setSize(drawingBufferSize.x, drawingBufferSize.y);
    uniforms.uResolution.value.copy(drawingBufferSize);
  }

  function render(renderer, scene, camera, elapsedTime) {
    uniforms.uTime.value = elapsedTime;

    renderer.setRenderTarget(renderTarget);
    renderer.clear();
    renderer.render(scene, camera);

    renderer.setRenderTarget(null);
    renderer.render(postScene, postCamera);
  }

  function dispose() {
    renderTarget.dispose();
    quad.geometry.dispose();
    material.dispose();
  }

  return {
    resize,
    render,
    dispose,
  };
}
