import * as THREE from "three";
import gsap from "gsap";

export interface MouthController {
  setSmile: (progress: number) => void;
  cleanup: () => void;
}

export const setupInteractiveSmile = (
  character: THREE.Object3D,
  hoverDiv: HTMLElement | null
): MouthController => {
  const faceMesh = (character.getObjectByName("Plane.007") ||
    character.getObjectByName("Plane007")) as THREE.Mesh | undefined;

  if (!faceMesh || !faceMesh.geometry) {
    return { setSmile: () => {}, cleanup: () => {} };
  }

  const geometry = faceMesh.geometry as THREE.BufferGeometry;
  const positionAttr = geometry.attributes.position;
  const basePositions = new Float32Array(positionAttr.array);

  // Identifikasi titik-titik vertex 3D pada area bibir
  const mouthIndices: {
    index: number;
    liftY: number;
    pullX: number;
  }[] = [];

  const count = positionAttr.count;
  for (let i = 0; i < count; i++) {
    const x = basePositions[i * 3];
    const y = basePositions[i * 3 + 1];
    const z = basePositions[i * 3 + 2];

    // Filter area bibir (permukaan depan z > 0.84, rentang vertikal y 12.35 - 12.58)
    if (z > 0.84 && y >= 12.35 && y <= 12.58 && Math.abs(x) < 0.34) {
      const distFromCenter = Math.abs(x);
      // Bobot kelengkungan: semakin ke sudut bibir luar, semakin terangkat
      const cornerWeight = Math.min(1, Math.pow(distFromCenter / 0.28, 1.5));
      const liftY = 0.042 * cornerWeight;
      const pullX = (x > 0 ? 0.012 : -0.012) * cornerWeight;

      mouthIndices.push({
        index: i,
        liftY,
        pullX,
      });
    }
  }

  const state = { smile: 0 };
  let tween: gsap.core.Tween | null = null;

  const updateVertices = (progress: number) => {
    const arr = positionAttr.array as Float32Array;
    for (let j = 0; j < mouthIndices.length; j++) {
      const { index, liftY, pullX } = mouthIndices[j];
      const idx = index * 3;
      arr[idx] = basePositions[idx] + pullX * progress;
      arr[idx + 1] = basePositions[idx + 1] + liftY * progress;
    }
    positionAttr.needsUpdate = true;
  };

  // Posisi default: Opsi A (Senyum tipis kalem resting state: progress 0)
  updateVertices(0);

  const onMouseEnter = () => {
    tween?.kill();
    tween = gsap.to(state, {
      smile: 1,
      duration: 0.5,
      ease: "power2.out",
      onUpdate: () => updateVertices(state.smile),
    });
  };

  const onMouseLeave = () => {
    tween?.kill();
    tween = gsap.to(state, {
      smile: 0,
      duration: 0.6,
      ease: "power2.inOut",
      onUpdate: () => updateVertices(state.smile),
    });
  };

  if (hoverDiv) {
    hoverDiv.addEventListener("mouseenter", onMouseEnter);
    hoverDiv.addEventListener("mouseleave", onMouseLeave);
  }

  const cleanup = () => {
    tween?.kill();
    if (hoverDiv) {
      hoverDiv.removeEventListener("mouseenter", onMouseEnter);
      hoverDiv.removeEventListener("mouseleave", onMouseLeave);
    }
  };

  const setSmile = (progress: number) => {
    state.smile = progress;
    updateVertices(progress);
  };

  return { setSmile, cleanup };
};

export default setupInteractiveSmile;
