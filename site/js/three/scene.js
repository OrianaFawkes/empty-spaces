import * as THREE from "three";

export function createEnvironmentScene(environmentConfig) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(environmentConfig.background);

  const fog = environmentConfig.fog;
  scene.fog = new THREE.Fog(fog.color, fog.near, fog.far);

  const cameraConfig = environmentConfig.camera;
  const camera = new THREE.PerspectiveCamera(
    cameraConfig.fov,
    window.innerWidth / window.innerHeight,
    cameraConfig.near,
    cameraConfig.far,
  );

  const cameraHome = new THREE.Vector3(...cameraConfig.position);
  const lookHome = new THREE.Vector3(...cameraConfig.target);

  camera.position.copy(cameraHome);
  camera.lookAt(lookHome);

  const lighting = environmentConfig.lighting;

  const hemisphere = new THREE.HemisphereLight(
    lighting.hemisphere.skyColor,
    lighting.hemisphere.groundColor,
    lighting.hemisphere.intensity,
  );
  scene.add(hemisphere);

  const key = new THREE.DirectionalLight(
    lighting.key.color,
    lighting.key.intensity,
  );
  key.position.set(...lighting.key.position);
  scene.add(key);

  const fill = new THREE.PointLight(
    lighting.fill.color,
    lighting.fill.intensity,
    lighting.fill.distance,
    lighting.fill.decay,
  );
  fill.position.set(...lighting.fill.position);
  scene.add(fill);

  const rim = new THREE.PointLight(
    lighting.rim.color,
    lighting.rim.intensity,
    lighting.rim.distance,
    lighting.rim.decay,
  );
  rim.position.set(...lighting.rim.position);
  scene.add(rim);

  const environmentRoot = new THREE.Group();
  scene.add(environmentRoot);

  return {
    scene,
    camera,
    cameraHome,
    lookHome,
    environmentRoot,
  };
}
