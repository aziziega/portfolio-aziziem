import * as THREE from "three";

/**
 * Creates a tapered hair strand geometry along a 3D CatmullRom spline.
 * Tapers smoothly from rootRadius at the base to tipRadius at the end, with ribbon flattening.
 */
const createTaperedStrand = (
  points: number[][],
  rootRadius: number,
  tipRadius: number,
  tubularSegments: number = 24,
  radialSegments: number = 10,
  ySquash: number = 0.72
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

      pos.setXYZ(
        idx,
        center.x + (vx - center.x) * factor,
        center.y + (vy - center.y) * factor * ySquash,
        center.z + (vz - center.z) * factor
      );
    }
  }
  geom.computeVertexNormals();
  return geom;
};

/**
 * Generates an authentic Korean/Modern Two-Block 60:40 Curtain Haircut.
 * Features a solid skull cap base and sweeping 60:40 parted curtain strands framing the face and glasses.
 */
export const createCurtainHair = (): THREE.Group => {
  const hairGroup = new THREE.Group();
  hairGroup.name = "CharacterCurtainHair6040";

  // Natural deep black hair material with soft specular highlight
  const hairMaterial = new THREE.MeshStandardMaterial({
    color: 0x111114,
    roughness: 0.52,
    metalness: 0.15,
  });

  // 1. Solid Anatomical Hair Cap (Hugs the skull top, sides, and back)
  const capGeom = new THREE.SphereGeometry(
    1.16,
    32,
    24,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.58
  );
  capGeom.scale(1.02, 0.92, 1.1);
  const capMesh = new THREE.Mesh(capGeom, hairMaterial);
  capMesh.position.set(0, 1.48, 0.08);
  capMesh.rotation.x = -0.12;
  hairGroup.add(capMesh);

  // 2. Sculpted 60:40 Curtain Strands
  const strands = [
    // 60% Major Side - Front main cascading curtain
    {
      pts: [
        [-0.08, 1.98, 1.05],
        [0.15, 1.92, 1.16],
        [0.36, 1.76, 1.22],
        [0.55, 1.54, 1.18],
        [0.64, 1.36, 1.08],
      ],
      r0: 0.09,
      r1: 0.016,
    },
    // 60% Major Side - Inner volume layer
    {
      pts: [
        [-0.04, 2.02, 1.02],
        [0.18, 1.95, 1.14],
        [0.4, 1.8, 1.18],
        [0.58, 1.6, 1.14],
      ],
      r0: 0.085,
      r1: 0.018,
    },
    // 60% Major Side - Temple & side drape
    {
      pts: [
        [0.28, 1.86, 1.12],
        [0.5, 1.7, 1.15],
        [0.68, 1.48, 1.08],
        [0.72, 1.28, 0.95],
      ],
      r0: 0.075,
      r1: 0.015,
    },
    // 40% Minor Side - Front main cascading curtain
    {
      pts: [
        [-0.14, 1.98, 1.05],
        [-0.3, 1.9, 1.15],
        [-0.48, 1.72, 1.2],
        [-0.6, 1.5, 1.14],
        [-0.66, 1.34, 1.05],
      ],
      r0: 0.085,
      r1: 0.016,
    },
    // 40% Minor Side - Inner volume layer
    {
      pts: [
        [-0.16, 2.02, 1.02],
        [-0.34, 1.94, 1.12],
        [-0.52, 1.76, 1.16],
        [-0.62, 1.56, 1.1],
      ],
      r0: 0.08,
      r1: 0.018,
    },
    // 60:40 Root Lift (The volume arch at the off-center part)
    {
      pts: [
        [-0.1, 2.06, 0.96],
        [-0.08, 2.04, 1.07],
        [0.05, 1.96, 1.14],
      ],
      r0: 0.08,
      r1: 0.02,
    },
    // Crown flow back (Right side)
    {
      pts: [
        [-0.08, 2.06, 0.92],
        [0.16, 1.98, 0.7],
        [0.35, 1.82, 0.4],
      ],
      r0: 0.08,
      r1: 0.025,
    },
    // Crown flow back (Left side)
    {
      pts: [
        [-0.14, 2.06, 0.92],
        [-0.26, 1.98, 0.7],
        [-0.4, 1.82, 0.4],
      ],
      r0: 0.075,
      r1: 0.025,
    },
  ];

  strands.forEach((strand) => {
    const geom = createTaperedStrand(strand.pts, strand.r0, strand.r1);
    const mesh = new THREE.Mesh(geom, hairMaterial);
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    hairGroup.add(mesh);
  });

  return hairGroup;
};

export default createCurtainHair;
