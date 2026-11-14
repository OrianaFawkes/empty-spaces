import * as THREE from "three";

export function createAnimationLoop({
  renderer,
  scene,
  camera,
  cameraController,
  postProcessing,
}) {
  const clock = new THREE.Clock();
  let visible = !document.hidden;
  let animationFrameId = null;
  let running = false;

  function handleVisibilityChange() {
    visible = !document.hidden;

    if (visible) {
      clock.start();
    }
  }

  function animate() {
    if (!running) return;

    animationFrameId = requestAnimationFrame(animate);

    if (!visible) return;

    const elapsed = clock.getElapsedTime();

    cameraController.update();
    postProcessing.render(renderer, scene, camera, elapsed);
  }

  function start() {
    if (running) return;

    running = true;
    clock.start();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    animate();
  }

  function stop() {
    running = false;

    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    document.removeEventListener("visibilitychange", handleVisibilityChange);
  }

  return {
    start,
    stop,
  };
}
