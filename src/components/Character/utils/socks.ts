import * as THREE from "three";

/**
 * Konfigurasi material celana pendek hitam, kulit kaki, dan kaus kaki putih bersih
 * menggunakan shader chunk injection (onBeforeCompile) agar batas warna 100% tajam
 * di level per-fragment pixel, tanpa ada efek gradasi luntur / cat semprot pada bidang poligon.
 */
export const configurePantsMaterial = (
  pantMesh: THREE.Mesh,
  skinColor: THREE.Color
) => {
  pantMesh.material = (pantMesh.material as THREE.MeshStandardMaterial).clone();
  const mat = pantMesh.material as THREE.MeshStandardMaterial;
  mat.vertexColors = false;
  mat.color.setRGB(1, 1, 1);
  mat.roughness = 0.65;
  mat.needsUpdate = true;

  if (pantMesh.geometry && pantMesh.geometry.attributes.color) {
    pantMesh.geometry.deleteAttribute("color");
  }

  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = `varying vec3 vBindPos;\n` + shader.vertexShader.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
       vBindPos = position;`
    );

    shader.fragmentShader = `varying vec3 vBindPos;\n` + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <color_fragment>",
      `
      // Pembagian zona warna berbasis koordinat model rest-pose Y
      float y = vBindPos.y;
      vec3 colShorts = vec3(0.0070, 0.0070, 0.0080); // Celana pendek hitam pekat #141416 (Linear sRGB matching shirt)
      vec3 colSkin = vec3(${skinColor.r.toFixed(4)}, ${skinColor.g.toFixed(4)}, ${skinColor.b.toFixed(4)});
      vec3 colSockBase = vec3(0.95, 0.95, 0.97); // Kaos kaki katun putih bersih #f2f2f6

      // Pusat elips penampang melintang kaki
      float legCenterX = vBindPos.x > 0.0 ? 0.902 : -0.902;
      float legCenterZ = -0.383;
      float angle = atan(vBindPos.z - legCenterZ, vBindPos.x - legCenterX);

      // Tekstur rajutan elastis bergaris vertikal halus (ribbed knit)
      float rib = sin(angle * 32.0) * 0.5 + 0.5;
      vec3 colSocks = mix(colSockBase * 0.93, colSockBase * 1.02, rib * 0.22);

      // Titik batas pemisah tegas
      float shortsBottom = 4.25;
      float cuffTop = 2.334;

      if (y >= shortsBottom) {
        // Celana pendek hitam dengan bayangan lipatan bawah (hem)
        float shortsHem = smoothstep(shortsBottom, shortsBottom + 0.035, y);
        diffuseColor.rgb = mix(colShorts * 0.7, colShorts, shortsHem);
      } else if (y >= cuffTop) {
        // Kulit kaki sawo matang alami
        diffuseColor.rgb = colSkin;
      } else {
        // Kaos kaki putih dengan bayangan lipatan atas (hem shadow)
        float hemShadow = smoothstep(cuffTop - 0.03, cuffTop, y);
        diffuseColor.rgb = mix(colSocks, colSocks * 0.75, hemShadow * 0.45);
      }
      `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <roughnessmap_fragment>",
      `
      float roughnessFactor = roughness;
      if (vBindPos.y >= 4.25) {
        roughnessFactor = 0.65; // Matte black shorts matching shirt roughness
      } else if (vBindPos.y >= 2.334) {
        roughnessFactor = 0.55; // Skin natural soft sheen
      } else {
        roughnessFactor = 0.78; // Knit cotton socks
      }
      `
    );
  };
};

/**
 * Membuat dan memasang kerah kaos kaki timbul 3D (Ribbed Sock Cuffs)
 * pada tulang betis (shin.L dan shin.R) agar kaos kaki memiliki ketebalan fisik
 * nyata dan menghasilkan bayangan alami di atas kulit kaki.
 */
export const attachSockCuffs = (character: THREE.Object3D) => {
  let shinL: THREE.Object3D | null = null;
  let shinR: THREE.Object3D | null = null;

  character.traverse((child) => {
    const name = child.name.toLowerCase();
    if (name === "shin.l" || name === "shinl" || name === "shin_l") {
      shinL = child;
    } else if (name === "shin.r" || name === "shinr" || name === "shin_r") {
      shinR = child;
    }
  });

  const cuffMat = new THREE.MeshStandardMaterial({
    color: 0xf4f4f6,
    roughness: 0.82,
    metalness: 0.02,
  });

  const createCuffMesh = (isLeft: boolean): THREE.Group => {
    const group = new THREE.Group();
    group.name = isLeft ? "LeftSockCuff" : "RightSockCuff";

    // 1. Badan silinder kerah lipatan kaos kaki
    const collarGeom = new THREE.CylinderGeometry(0.81, 0.78, 0.32, 32);
    const collar = new THREE.Mesh(collarGeom, cuffMat);
    collar.scale.set(0.92, 1.0, 1.1);
    group.add(collar);

    // 2. Lipatan membulat elastis di tepi atas (rolled hem)
    const rimGeom = new THREE.TorusGeometry(0.79, 0.045, 16, 32);
    const rim = new THREE.Mesh(rimGeom, cuffMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.16;
    rim.scale.set(0.92, 1.1, 1.0);
    group.add(rim);

    // Posisi presisi di koordinat lokal tulang shin
    const posX = isLeft ? 0.068 : -0.068;
    group.position.set(posX, 1.746, 0.035);

    return group;
  };

  if (shinL) {
    const oldCuffL = (shinL as THREE.Object3D).getObjectByName("LeftSockCuff");
    if (oldCuffL) (shinL as THREE.Object3D).remove(oldCuffL);
    (shinL as THREE.Object3D).add(createCuffMesh(true));
  }

  if (shinR) {
    const oldCuffR = (shinR as THREE.Object3D).getObjectByName("RightSockCuff");
    if (oldCuffR) (shinR as THREE.Object3D).remove(oldCuffR);
    (shinR as THREE.Object3D).add(createCuffMesh(false));
  }
};
