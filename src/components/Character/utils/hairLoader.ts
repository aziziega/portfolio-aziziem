import * as THREE from "three";
import { GLTFLoader, DRACOLoader } from "three-stdlib";

/**
 * Loads a custom 3D hair model (e.g. comma hair GLB) and attaches it to the character head bone.
 * If the file is placed in /models/comma_hair.glb, it seamlessly replaces the default hair mesh.
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
      console.log("Model rambut comma hair berhasil dimuat ke karakter!");
    },
    undefined,
    () => {
      console.info(
        "File /models/comma_hair.glb belum terdeteksi. Menggunakan rambut default hingga file 3D ditambahkan."
      );
    }
  );
};

export default loadCustomHair;
