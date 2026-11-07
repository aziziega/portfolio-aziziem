import * as THREE from "three";

export interface LipOptions {
  /**
   * Warna rona bibir (default: Tone 1 Natural Warm Rosy #b85c54)
   */
  lipColor?: string;
  /**
   * Warna garis crease belahan bibir agar berdimensi (default: #7e3832)
   */
  creaseColor?: string;
  /**
   * Intensitas kemerahan (0.0 - 1.0, default: 0.85)
   */
  intensity?: number;
  /**
   * Roughness bibir (nilai lebih rendah = bibir lebih lembap alami/subtle specular, default: 0.40)
   */
  roughness?: number;
}

/**
 * Mengonfigurasi material wajah (Plane.007) dengan injeksi shader chunk (onBeforeCompile)
 * untuk menambahkan rona bibir kemerahan alami yang proporsional.
 *
 * Keunggulan:
 * 1. Pixel-perfect: gradasi elips + Cupid's bow halus tanpa pecah di tingkat fragment.
 * 2. Sinkron dengan animasi senyum: membaca posisi vertex dinamis sehingga rona bibir ikut meregang saat tersenyum.
 * 3. Tidak mempengaruhi mata, alis, hidung, maupun dagu.
 */
export const configureFaceMaterial = (
  faceMesh: THREE.Mesh,
  skinColor: THREE.Color,
  options: LipOptions = {}
) => {
  const {
    lipColor = "#b85c54",
    creaseColor = "#7e3832",
    intensity = 0.85,
    roughness = 0.40,
  } = options;

  faceMesh.material = (faceMesh.material as THREE.MeshStandardMaterial).clone();
  const mat = faceMesh.material as THREE.MeshStandardMaterial;

  mat.vertexColors = false;
  mat.color.copy(skinColor);
  mat.roughness = 0.55;
  mat.needsUpdate = true;

  if (faceMesh.geometry && faceMesh.geometry.attributes.color) {
    faceMesh.geometry.deleteAttribute("color");
  }

  const colLip = new THREE.Color(lipColor);
  const colCrease = new THREE.Color(creaseColor);

  mat.onBeforeCompile = (shader) => {
    // 1. Injeksi posisi vertex dinamis ke varying vFacePos
    shader.vertexShader =
      `varying vec3 vFacePos;\n` +
      shader.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
         vFacePos = position;`
      );

    // 2. Deklarasi varying di fragment shader
    shader.fragmentShader =
      `varying vec3 vFacePos;\n` + shader.fragmentShader;

    // 3. Injeksi pewarnaan bibir pada diffuseColor
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <color_fragment>",
      `#include <color_fragment>

      // Masker bibir presisi 3D (Z > 0.84, rentang Y mulut: 12.44 - 12.60)
      if (vFacePos.z > 0.84) {
        float lipW = 0.27;
        float nx = vFacePos.x / lipW;
        if (abs(nx) < 1.0) {
          // Garis tengah bibir (crease) sedikit melengkung ke atas di sudut senyum
          float creaseY = 12.535 + 0.018 * (nx * nx);
          float distSq = 0.0;

          if (vFacePos.y >= creaseY) {
            // Bibir Atas: Lekukan Cupid's bow di tengah
            float dip = 0.22 * exp(-16.0 * (nx * nx));
            float nyEff = (vFacePos.y - (creaseY - dip * 0.01)) / (0.055 * (1.0 - dip));
            distSq = nx * nx + nyEff * nyEff;
          } else {
            // Bibir Bawah: Bantalan bibir bawah lebih penuh & bulat alami
            float ny = (creaseY - vFacePos.y) / 0.080;
            distSq = nx * nx + ny * ny;
          }

          if (distSq < 1.0) {
            // Gradasi halus transisi ke kulit wajah
            float t = clamp((1.0 - distSq) / 0.65, 0.0, 1.0);
            float lipMask = t * t * (3.0 - 2.0 * t);

            // Garis belahan mulut (crease) lebih gelap untuk kedalaman 3D
            float creaseDist = abs(vFacePos.y - creaseY) / 0.018;
            float creaseMask = clamp(1.0 - creaseDist, 0.0, 1.0) * (1.0 - abs(nx));

            vec3 cLipBase = vec3(${colLip.r.toFixed(4)}, ${colLip.g.toFixed(4)}, ${colLip.b.toFixed(4)});
            vec3 cCrease = vec3(${colCrease.r.toFixed(4)}, ${colCrease.g.toFixed(4)}, ${colCrease.b.toFixed(4)});
            vec3 cFinalLip = mix(cLipBase, cCrease, creaseMask * 0.45);

            diffuseColor.rgb = mix(diffuseColor.rgb, cFinalLip, lipMask * ${intensity.toFixed(3)});
          }
        }
      }`
    );

    // 4. Injeksi kelembapan/glossiness alami pada area bibir
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <roughnessmap_fragment>",
      `#include <roughnessmap_fragment>

      if (vFacePos.z > 0.84) {
        float lipW = 0.27;
        float nx = vFacePos.x / lipW;
        if (abs(nx) < 1.0) {
          float creaseY = 12.535 + 0.018 * (nx * nx);
          float distSq = 0.0;
          if (vFacePos.y >= creaseY) {
            float dip = 0.22 * exp(-16.0 * (nx * nx));
            float nyEff = (vFacePos.y - (creaseY - dip * 0.01)) / (0.055 * (1.0 - dip));
            distSq = nx * nx + nyEff * nyEff;
          } else {
            float ny = (creaseY - vFacePos.y) / 0.080;
            distSq = nx * nx + ny * ny;
          }
          if (distSq < 1.0) {
            float t = clamp((1.0 - distSq) / 0.65, 0.0, 1.0);
            float lipMask = t * t * (3.0 - 2.0 * t);
            roughnessFactor = mix(roughnessFactor, ${roughness.toFixed(3)}, lipMask * 0.65);
          }
        }
      }`
    );
  };
};

export default configureFaceMaterial;
