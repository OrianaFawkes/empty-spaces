import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

function disposeObject(root) {
  root.traverse((object) => {
    if (!object.isMesh) return;

    object.geometry?.dispose();

    const materials = Array.isArray(object.material)
      ? object.material
      : [object.material];

    for (const material of materials) {
      if (!material) continue;

      // Dispose textures owned by this model's materials.
      for (const value of Object.values(material)) {
        if (value?.isTexture) value.dispose();
      }

      material.dispose();
    }
  });
}

export function createEnvironmentLoader(environmentRoot) {
  const loader = new GLTFLoader();
  let activeScene = null;

  function load(environmentConfig) {
    return new Promise((resolve, reject) => {
      loader.load(
        environmentConfig.model,
        (gltf) => {
          if (activeScene) {
            environmentRoot.remove(activeScene);
            disposeObject(activeScene);
          }

          activeScene = gltf.scene;

          activeScene.traverse((object) => {
            if (!object.isMesh) return;

            object.castShadow = false;
            object.receiveShadow = false;

            if (object.material) {
              const materials = Array.isArray(object.material)
                ? object.material
                : [object.material];

              for (const material of materials) {
                material.needsUpdate = true;
              }
            }
          });

          environmentRoot.add(activeScene);
          console.info("Loaded environment:", environmentConfig.model, gltf);
          resolve(gltf);
        },
        (event) => {
          if (event.total) {
            console.info(
              `Loading environment: ${Math.round(
                (event.loaded / event.total) * 100,
              )}%`,
            );
          }
        },
        (error) => {
          console.error(
            "Could not load the GLB environment:",
            environmentConfig.model,
            error,
          );
          reject(error);
        },
      );
    });
  }

  function dispose() {
    if (!activeScene) return;

    environmentRoot.remove(activeScene);
    disposeObject(activeScene);
    activeScene = null;
  }

  return {
    load,
    dispose,
  };
}
