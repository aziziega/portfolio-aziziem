import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import { setProgress } from "../Loading";
import createGlasses from "./utils/glasses";
import createMacbook from "./utils/macbook";
import loadCustomHair from "./utils/hairLoader";

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(new THREE.Scene());
  const { setLoading } = useLoading();

  const [character, setChar] = useState<THREE.Object3D | null>(null);
  useEffect(() => {
    if (canvasDiv.current) {
      let rect = canvasDiv.current.getBoundingClientRect();
      let container = { width: rect.width, height: rect.height };
      const aspect = container.width / container.height;
      const scene = sceneRef.current;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: window.devicePixelRatio < 2,
        powerPreference: "high-performance",
      });
      renderer.setSize(container.width, container.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      canvasDiv.current.appendChild(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
      camera.position.z = 10;
      camera.position.set(0, 13.1, 24.7);
      camera.zoom = 1.1;
      camera.updateProjectionMatrix();

      let headBone: THREE.Object3D | null = null;
      let screenLight: any | null = null;
      let mixer: THREE.AnimationMixer;

      const clock = new THREE.Clock();

      const light = setLighting(scene);
      let progress = setProgress((value) => setLoading(value));
      const { loadCharacter } = setCharacter(renderer, scene, camera);

      loadCharacter().then((gltf) => {
        if (gltf) {
          const animations = setAnimations(gltf);
          hoverDivRef.current && animations.hover(gltf, hoverDivRef.current);
          mixer = animations.mixer;
          let character = gltf.scene;
          setChar(character);
          scene.add(character);

          // Ubah baju menjadi warna hitam elegan
          const shirt =
            character.getObjectByName("BODYSHIRT") ||
            character.getObjectByName("BODY.SHIRT");
          if (shirt && (shirt as THREE.Mesh).isMesh) {
            const shirtMesh = shirt as THREE.Mesh;
            shirtMesh.material = (
              shirtMesh.material as THREE.MeshStandardMaterial
            ).clone();
            (shirtMesh.material as THREE.MeshStandardMaterial).color.set(
              "#141416"
            );
            (shirtMesh.material as THREE.MeshStandardMaterial).roughness = 0.65;
          }

          // Celana Pendek Hitam + Kulit Kaki + Kaus Kaki Putih (Opsi 2)
          const pant = character.getObjectByName("Pant");
          if (pant && (pant as THREE.Mesh).isMesh) {
            const pantMesh = pant as THREE.Mesh;
            pantMesh.material = (
              pantMesh.material as THREE.MeshStandardMaterial
            ).clone();
            const mat = pantMesh.material as THREE.MeshStandardMaterial;
            mat.vertexColors = true;
            mat.color.setRGB(1, 1, 1);
            mat.roughness = 0.65;
            mat.needsUpdate = true;

            const geometry = pantMesh.geometry;
            const position = geometry.attributes.position;
            const count = position.count;
            const colors = new Float32Array(count * 3);

            const colorShorts = new THREE.Color("#141416"); // Celana pendek hitam
            const colorSkin = new THREE.Color(0.8, 0.8, 0.8); // Kulit kaki serasi dengan karakter
            const colorSocks = new THREE.Color("#f0f0f4");  // Kaus kaki putih

            for (let i = 0; i < count; i++) {
              const y = position.getY(i);
              let c = colorSocks;
              if (y >= 4.2) {
                c = colorShorts;
              } else if (y >= 2.5) {
                c = colorSkin;
              } else {
                c = colorSocks;
              }
              colors[i * 3] = c.r;
              colors[i * 3 + 1] = c.g;
              colors[i * 3 + 2] = c.b;
            }

            geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
            if (geometry.attributes.color) {
              geometry.attributes.color.needsUpdate = true;
            }
          }

          // Sembunyikan monitor desktop PC lama, keyboard lama, dan floating screenlight lama
          character.traverse((child: any) => {
            if (
              child.name === "Keyboard" ||
              child.name.includes("KEYS") ||
              child.name === "Plane004" ||
              child.name === "Plane.004" ||
              child.name === "screenlight"
            ) {
              child.visible = false;
            }
          });

          // Tambahkan 3D MacBook Pro di atas meja
          const macbook = createMacbook();
          macbook.position.set(0.08, 9.09, 3.65);
          character.add(macbook);

          headBone =
            character.getObjectByName("spine006") ||
            character.getObjectByName("spine.006") ||
            null;
          if (headBone) {
            const glasses = createGlasses();
            headBone.add(glasses);
            loadCustomHair(headBone, character);
          }
          screenLight = character.getObjectByName("screenlight") || null;
          progress.loaded().then(() => {
            setTimeout(() => {
              light.turnOnLights();
              animations.startIntro();
            }, 2500);
          });
          window.addEventListener("resize", () =>
            handleResize(renderer, camera, canvasDiv, character)
          );
        }
      });

      let mouse = { x: 0, y: 0 },
        interpolation = { x: 0.1, y: 0.2 };

      const onMouseMove = (event: MouseEvent) => {
        handleMouseMove(event, (x, y) => (mouse = { x, y }));
      };
      let debounce: number | undefined;
      const onTouchStart = (event: TouchEvent) => {
        const element = event.target as HTMLElement;
        debounce = setTimeout(() => {
          element?.addEventListener("touchmove", (e: TouchEvent) =>
            handleTouchMove(e, (x, y) => (mouse = { x, y }))
          );
        }, 200);
      };

      const onTouchEnd = () => {
        handleTouchEnd((x, y, interpolationX, interpolationY) => {
          mouse = { x, y };
          interpolation = { x: interpolationX, y: interpolationY };
        });
      };

      document.addEventListener("mousemove", (event) => {
        onMouseMove(event);
      });
      const landingDiv = document.getElementById("landingDiv");
      if (landingDiv) {
        landingDiv.addEventListener("touchstart", onTouchStart);
        landingDiv.addEventListener("touchend", onTouchEnd);
      }
      const animate = () => {
        requestAnimationFrame(animate);
        if (headBone) {
          handleHeadRotation(
            headBone,
            mouse.x,
            mouse.y,
            interpolation.x,
            interpolation.y,
            THREE.MathUtils.lerp
          );
          light.setPointLight(screenLight);
        }
        const delta = clock.getDelta();
        if (mixer) {
          mixer.update(delta);
        }
        renderer.render(scene, camera);
      };
      animate();
      return () => {
        clearTimeout(debounce);
        scene.clear();
        renderer.dispose();
        window.removeEventListener("resize", () =>
          handleResize(renderer, camera, canvasDiv, character!)
        );
        if (canvasDiv.current) {
          canvasDiv.current.removeChild(renderer.domElement);
        }
        if (landingDiv) {
          document.removeEventListener("mousemove", onMouseMove);
          landingDiv.removeEventListener("touchstart", onTouchStart);
          landingDiv.removeEventListener("touchend", onTouchEnd);
        }
      };
    }
  }, []);

  return (
    <>
      <div className="character-container">
        <div className="character-model" ref={canvasDiv}>
          <div className="character-rim"></div>
          <div className="character-hover" ref={hoverDivRef}></div>
        </div>
      </div>
    </>
  );
};

export default Scene;
