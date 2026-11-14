import * as THREE from "three";

export function createCameraController(camera, cameraConfig) {
  const targetPointer = new THREE.Vector2(0, 0);
  const currentPointer = new THREE.Vector2(0, 0);

  const cameraHome = new THREE.Vector3(...cameraConfig.position);
  const lookHome = new THREE.Vector3(...cameraConfig.target);

  const currentCameraPosition = cameraHome.clone();
  const currentLookTarget = lookHome.clone();
  const desiredCameraPosition = cameraHome.clone();
  const desiredLookTarget = lookHome.clone();

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = motionQuery.matches;

  // Determine the camera's local right/up axes from its home orientation.
  // This is important because different GLB environments may face
  // different world directions.
  const homeCamera = camera.clone();
  homeCamera.position.copy(cameraHome);
  homeCamera.lookAt(lookHome);
  homeCamera.updateMatrixWorld(true);

  const cameraRight = new THREE.Vector3()
    .setFromMatrixColumn(homeCamera.matrixWorld, 0)
    .normalize();

  const cameraUp = new THREE.Vector3()
    .setFromMatrixColumn(homeCamera.matrixWorld, 1)
    .normalize();

  const pointerOffset = new THREE.Vector3();

  function handlePointerMove(event) {
    targetPointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    targetPointer.y = -(event.clientY / window.innerHeight - 0.5) * 2;
  }

  function handleMotionChange(event) {
    reducedMotion = event.matches;

    if (reducedMotion) {
      targetPointer.set(0, 0);
      currentPointer.set(0, 0);
    }
  }

  window.addEventListener("pointermove", handlePointerMove);
  motionQuery.addEventListener("change", handleMotionChange);

  function update() {
    if (reducedMotion) {
      currentPointer.set(0, 0);
    } else {
      currentPointer.lerp(targetPointer, cameraConfig.parallax.smoothing);
    }

    const parallax = cameraConfig.parallax;

    // Translate along the camera's local viewing plane, not world X/Y.
    // Both camera and look target receive the same offset, so their
    // distance and orientation remain unchanged.
    pointerOffset
      .copy(cameraRight)
      .multiplyScalar(currentPointer.x * parallax.horizontal)
      .addScaledVector(cameraUp, currentPointer.y * parallax.vertical);

    desiredCameraPosition.copy(cameraHome).add(pointerOffset);
    desiredLookTarget.copy(lookHome).add(pointerOffset);

    currentCameraPosition.lerp(desiredCameraPosition, parallax.smoothing);
    currentLookTarget.lerp(desiredLookTarget, parallax.smoothing);

    camera.position.copy(currentCameraPosition);
    camera.lookAt(currentLookTarget);
  }

  function dispose() {
    window.removeEventListener("pointermove", handlePointerMove);
    motionQuery.removeEventListener("change", handleMotionChange);
  }

  return {
    update,
    dispose,
  };
}
