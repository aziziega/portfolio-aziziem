import * as THREE from "three";

/**
 * Creates a tapered hair strand geometry along a 3D CatmullRom spline.
 * Tapers from rootRadius at the base to tipRadius at the end, with a slight ribbon flattening.
 */
const createTaperedStrand = (
  points: number[][],
  rootRadius: number,
  tipRadius: number,
  tubularSegments: number = 24,
  radialSegments: number = 10
): THREE.BufferGeometry => {
  const curve = new THREE.CatmullRomCurve3(
    points.map((p) => new THREE.Vector3(p[0], p[1], p[2]))
  );
  const geom = new THREE.TubeGeometry(
    curve,
    tubularSegments,
    rootRadius,
    radialSegments,
    false
  );
  const pos = geom.attributes.position;
  const curvePoints = curve.getPoints(tubularSegments);

  for (let i = 0; i <= tubularSegments; i++) {
    const t = i / tubularSegments;
    const factor = 1 - t + t * (tipRadius / rootRadius);
    const center = curvePoints[i];

    for (let j = 0; j <= radialSegments; j++) {
      const idx = i * (radialSegments + 1) + j;
      const vx = pos.getX(idx);
      const vy = pos.getY(idx);
      const vz = pos.getZ(idx);

      // Slight compression along local Y for natural hair-ribbon volume
      pos.setXYZ(
        idx,
        center.x + (vx - center.x) * factor,
        center.y + (vy - center.y) * factor * 0.72,
        center.z + (vz - center.z) * factor
      );
    }
  }
  geom.computeVertexNormals();
  return geom;
};

/**
 * Generates the iconic modern Comma Hair style (belahan samping dengan poni melengkung huruf "C" / koma).
 * Perfectly calibrated to match the character's headBone (spine006) coordinate space.
 */
export const createCommaHair = (): THREE.Group => {
  const hairGroup = new THREE.Group();
  hairGroup.name = "CharacterCommaHair";

  // Material matching the existing dark stylized hair texture
  const hairMaterial = new THREE.MeshStandardMaterial({
    color: 0x0a0a0c,
    roughness: 0.55,
    metalness: 0.12,
  });

  const strandsData = [
    // 1. Helai Utama Poni Koma (Outer primary curve hooking inwards across forehead)
    {
      points: [
        [-0.04, 1.95, 1.05],
        [0.2, 1.84, 1.16],
        [0.38, 1.64, 1.22],
        [0.34, 1.44, 1.25],
        [0.18, 1.38, 1.22],
        [0.08, 1.44, 1.18],
      ],
      rootRadius: 0.08,
      tipRadius: 0.015,
    },
    // 2. Helai Dalam Poni Koma (Inner layered volume for depth & shine)
    {
      points: [
        [-0.08, 1.92, 1.07],
        [0.14, 1.8, 1.18],
        [0.3, 1.62, 1.24],
        [0.26, 1.46, 1.25],
        [0.14, 1.41, 1.21],
      ],
      rootRadius: 0.07,
      tipRadius: 0.014,
    },
    // 3. Aksen Atas Lengkungan Koma (Upper fringe accent)
    {
      points: [
        [0.02, 1.9, 1.1],
        [0.24, 1.74, 1.2],
        [0.32, 1.54, 1.24],
        [0.2, 1.44, 1.22],
      ],
      rootRadius: 0.065,
      tipRadius: 0.012,
    },
    // 4. Belahan Kiri (Secondary natural side-sweep on the opposite side of the part)
    {
      points: [
        [-0.1, 1.95, 1.05],
        [-0.26, 1.82, 1.16],
        [-0.42, 1.64, 1.21],
        [-0.48, 1.46, 1.17],
      ],
      rootRadius: 0.078,
      tipRadius: 0.016,
    },
    // 5. Belahan Kiri Lapisan Atas (Upper left sweep layer)
    {
      points: [
        [-0.14, 1.96, 1.07],
        [-0.32, 1.84, 1.16],
        [-0.48, 1.68, 1.18],
      ],
      rootRadius: 0.065,
      tipRadius: 0.014,
    },
    // 6. Volume Belahan Rambut Atas (Parting line root lift at crown)
    {
      points: [
        [-0.06, 2.02, 0.96],
        [-0.04, 1.98, 1.07],
        [0.08, 1.9, 1.13],
      ],
      rootRadius: 0.07,
      tipRadius: 0.02,
    },
  ];

  strandsData.forEach((strand) => {
    const geom = createTaperedStrand(
      strand.points,
      strand.rootRadius,
      strand.tipRadius
    );
    const mesh = new THREE.Mesh(geom, hairMaterial);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    hairGroup.add(mesh);
  });

  return hairGroup;
};

export default createCommaHair;
