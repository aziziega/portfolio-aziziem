import * as THREE from "three";

export const createGlasses = (): THREE.Group => {
  const glasses = new THREE.Group();
  glasses.name = "CharacterGlasses";

  // Frame Material - Modern dark matte obsidian/titanium
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x16161a,
    metalness: 0.85,
    roughness: 0.25,
  });

  // Hinge accent material - subtle refined metallic tone
  const hingeMaterial = new THREE.MeshStandardMaterial({
    color: 0xc8a45e,
    metalness: 0.9,
    roughness: 0.2,
  });

  // Lens Material - Realistic clear glass with reflection and subtle opacity
  const lensMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf4f8ff,
    transparent: true,
    opacity: 0.22,
    roughness: 0.05,
    metalness: 0.1,
    transmission: 0.92,
    ior: 1.5,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const eyeDistance = 0.437;
  const rimRadius = 0.34;
  const rimTube = 0.026;

  [-1, 1].forEach((side) => {
    // 1. Rims (Left & Right)
    const rimGeom = new THREE.TorusGeometry(rimRadius, rimTube, 16, 40);
    const rim = new THREE.Mesh(rimGeom, frameMaterial);
    rim.position.set(side * eyeDistance, 0, 0);
    rim.scale.set(1.12, 0.95, 1);
    glasses.add(rim);

    // 2. Lenses (Left & Right)
    const lensGeom = new THREE.CircleGeometry(rimRadius * 1.08, 32);
    const lens = new THREE.Mesh(lensGeom, lensMaterial);
    lens.position.set(side * eyeDistance, 0, 0);
    lens.scale.set(1.12, 0.95, 1);
    glasses.add(lens);

    // 3. Hinges (Outer corner accents)
    const hingeGeom = new THREE.CylinderGeometry(0.022, 0.022, 0.05, 12);
    const hinge = new THREE.Mesh(hingeGeom, hingeMaterial);
    hinge.position.set(side * (eyeDistance + rimRadius * 1.12), 0.02, -0.02);
    glasses.add(hinge);

    // 4. Temple Arms (Gagang kacamata dikeluarkan di luar kulit dan bertapak pas di atas lekukan daun telinga)
    const templeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * (eyeDistance + rimRadius * 1.12), 0.02, -0.02), // Engsel depan frame
      new THREE.Vector3(side * 0.93, 0.04, -0.18),                             // Melayang rapi di luar kulit pelipis depan
      new THREE.Vector3(side * 1.01, 0.06, -0.36),                             // Menyusuri samping pelipis luar
      new THREE.Vector3(side * 1.07, 0.08, -0.52),                             // Bertengger pas di atas lekukan daun telinga
      new THREE.Vector3(side * 1.05, 0.01, -0.64),                             // Melengkung turun di belakang telinga
      new THREE.Vector3(side * 1.02, -0.08, -0.74),                            // Ujung gagang kacamata
    ]);
    const templeGeom = new THREE.TubeGeometry(templeCurve, 32, 0.018, 8, false);
    const temple = new THREE.Mesh(templeGeom, frameMaterial);
    glasses.add(temple);

    // 5. Nose pad arm & pad (Penyangga hidung)
    const padArmCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * (eyeDistance - rimRadius * 0.8), -0.02, -0.01),
      new THREE.Vector3(side * 0.14, -0.07, -0.04),
    ]);
    const padArmGeom = new THREE.TubeGeometry(padArmCurve, 8, 0.012, 6, false);
    const padArm = new THREE.Mesh(padArmGeom, frameMaterial);
    glasses.add(padArm);

    const padGeom = new THREE.BoxGeometry(0.025, 0.06, 0.015);
    const pad = new THREE.Mesh(padGeom, lensMaterial);
    pad.position.set(side * 0.14, -0.07, -0.045);
    pad.rotation.y = side * 0.3;
    glasses.add(pad);
  });

  // 6. Bridge (Jembatan hidung penghubung frame)
  const bridgeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-(eyeDistance - rimRadius * 0.95), 0.04, -0.01),
    new THREE.Vector3(0, 0.1, 0.02),
    new THREE.Vector3(eyeDistance - rimRadius * 0.95, 0.04, -0.01),
  ]);
  const bridgeGeom = new THREE.TubeGeometry(bridgeCurve, 16, 0.022, 8, false);
  const bridge = new THREE.Mesh(bridgeGeom, frameMaterial);
  glasses.add(bridge);

  // Position relative to spine006 bone local space
  glasses.position.set(0, 1.22, 1.16);

  // Disable shadow casting to match character rendering optimization
  glasses.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = false;
      child.receiveShadow = false;
    }
  });

  return glasses;
};

export default createGlasses;
