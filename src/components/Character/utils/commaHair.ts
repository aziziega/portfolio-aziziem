import * as THREE from "three";

/**
 * Sculpts the character's base hair mesh vertices in-place into a clean,
 * modern Side-Part / Two-Block style (belahan rapi mengekspos dahi kanan,
 * poni kiri jatuh alami dan bersih tanpa jambul melengkung yang menonjol).
 */
export const sculptCommaHair = (character: THREE.Object3D) => {
  const hairMesh = character.getObjectByName("hair") as THREE.Mesh | null;
  if (!hairMesh || !hairMesh.geometry) return;

  const geom = hairMesh.geometry;
  const pos = geom.attributes.position;
  if (!pos) return;

  // Pastikan tidak ada mesh jambul / lock terpisah yang menempel
  const existingLock = hairMesh.getObjectByName("VolumetricCommaLock");
  if (existingLock) {
    hairMesh.remove(existingLock);
  }

  // Simpan posisi original agar operasi sculpting selalu idempoten (tahan HMR/remount)
  if (!geom.userData.originalPositions) {
    geom.userData.originalPositions = pos.clone();
  }
  const origPos = geom.userData.originalPositions as THREE.BufferAttribute;

  // Sempurnakan material rambut: hitam pekat natural dengan specular sheen lembut
  if (hairMesh.material) {
    const mat = hairMesh.material as THREE.MeshStandardMaterial;
    mat.color.set("#0e0d10");
    mat.roughness = 0.48;
    mat.metalness = 0.18;
  }

  const partingX = -0.016;

  for (let i = 0; i < origPos.count; i++) {
    let x = origPos.getX(i);
    let y = origPos.getY(i);
    let z = origPos.getZ(i);

    // Target area poni depan dan dahi dalam ruang lokal hair mesh
    if (z > 0.035 && y < 0.10) {
      if (x < partingX) {
        // 1. SISI BELAHAN (Swept side fringe - karakter kanan / viewer kiri)
        const dist = Math.abs(x - partingX);
        if (dist < 0.065) {
          const t = Math.cos((dist / 0.065) * Math.PI * 0.5);
          if (y < 0.065) {
            const lift = Math.max(0, 1 - (y - 0.038) / 0.027);
            y += t * lift * 0.036;
            z -= t * 0.015;
          }
          x -= t * 0.008;
        }
      } else {
        // 2. SISI KIRI (Poni natural jatuh bersih membingkai alis kiri - tanpa jambul)
        const dist = x - partingX;

        // A. Root volume halus pada puncak belahan rambut
        if (dist < 0.045 && y > 0.055) {
          const rootFactor = Math.sin((dist / 0.045) * Math.PI);
          y += rootFactor * 0.014;
          z += rootFactor * 0.010;
        }

        // B. Aliran poni alami membingkai dahi kiri secara rapi dan rata
        if (x >= -0.005 && x <= 0.070 && y < 0.070) {
          const drapeFactor = Math.max(0, 1 - Math.abs(x - 0.035) / 0.040);
          y -= drapeFactor * 0.006;
          z += drapeFactor * 0.006;
        }
      }
    }

    pos.setXYZ(i, x, y, z);
  }

  pos.needsUpdate = true;
  geom.computeVertexNormals();
};

/**
 * Hook kompatibilitas untuk hairLoader (mengembalikan group kosong tanpa jambul).
 */
export const createCommaHairLock = (): THREE.Group => {
  const lockGroup = new THREE.Group();
  lockGroup.name = "CommaHairLock";
  return lockGroup;
};

export default sculptCommaHair;
