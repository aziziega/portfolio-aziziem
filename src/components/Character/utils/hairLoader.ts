import * as THREE from "three";
import { GLTFLoader, DRACOLoader } from "three-stdlib";
import { sculptCommaHair, createCommaHairLock } from "./commaHair";

/**
 * Loads a custom 3D hair model (e.g. comma hair GLB) or sculpts the native
 * stylized Modern Korean Comma Hair directly on the character.
 */
export const loadCustomHair = (
  headBone: THREE.Object3D,
  character: THREE.Object3D
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  loader.load(
    "/models/comma_hair.glb",
    (gltf) => {
      // Hide default hair when custom model is loaded
      const defaultHair = character.getObjectByName("hair");
      if (defaultHair) {
        defaultHair.visible = false;
      }

      const hairModel = gltf.scene;
      hairModel.name = "CustomCommaHair";

      hairModel.traverse((child: any) => {
        if (child.isMesh) {
          child.castShadow = false;
          child.receiveShadow = false;
        }
      });

      headBone.add(hairModel);
      console.log("Model rambut comma hair (GLB) berhasil dimuat ke karakter!");
    },
    undefined,
    () => {
      // 1. Sculpt native base hair in-place into Modern Comma Hair
      sculptCommaHair(character);

      // 2. Attach the signature 3D Comma Hair Lock directly to the head bone
      const commaLock = createCommaHairLock();
      headBone.add(commaLock);

      console.log("Modern Comma Hair 3D berhasil diaplikasikan ke karakter!");
    }
  );
};

export default loadCustomHair;
