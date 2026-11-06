import * as THREE from "three";

export const handleMouseMove = (
  event: MouseEvent,
  setMousePosition: (x: number, y: number) => void
) => {
  const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
  const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  setMousePosition(mouseX, mouseY);
};

export const handleTouchMove = (
  event: TouchEvent,
  setMousePosition: (x: number, y: number) => void
) => {
  const mouseX = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
  const mouseY = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
  setMousePosition(mouseX, mouseY);
};

export const handleTouchEnd = (
  setMousePosition: (
    x: number,
    y: number,
    interpolationX: number,
    interpolationY: number
  ) => void
) => {
  setTimeout(() => {
    setMousePosition(0, 0, 0.03, 0.03);
    setTimeout(() => {
      setMousePosition(0, 0, 0.1, 0.2);
    }, 1000);
  }, 2000);
};

export const handleHeadRotation = (
  headBone: THREE.Object3D,
  mouseX: number,
  mouseY: number,
  interpolationX: number,
  interpolationY: number,
  lerp: (x: number, y: number, t: number) => number
) => {
  if (!headBone) return;

  const scrollY = window.scrollY;
  // Blend factor: 1 at top (scrollY <= 100), smoothly tapering to 0 at scrollY >= 300
  const mouseWeight = Math.max(0, Math.min(1, 1 - (scrollY - 100) / 200));

  const maxRotation = Math.PI / 6;
  const targetMouseY = mouseX * maxRotation;
  const clampedMouseY = Math.max(-0.3, Math.min(0.4, mouseY));
  const targetMouseX = -clampedMouseY - 0.5 * maxRotation;

  // Static target during scroll down (desk / typing focus)
  const staticTargetX = -0.4;
  const staticTargetY = -0.3;

  // Smoothly blended targets
  const finalTargetX = mouseWeight * targetMouseX + (1 - mouseWeight) * staticTargetX;
  const finalTargetY = mouseWeight * targetMouseY + (1 - mouseWeight) * staticTargetY;

  headBone.rotation.x = lerp(headBone.rotation.x, finalTargetX, interpolationX);
  headBone.rotation.y = lerp(headBone.rotation.y, finalTargetY, interpolationY);
};
