import { useEffect, useRef } from "react";
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
import { configurePantsMaterial, attachSockCuffs } from "./utils/socks";
import setupInteractiveSmile, { MouthController } from "./utils/mouthController";
import configureFaceMaterial from "./utils/lips";

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const { setLoading } = useLoading();

  useEffect(() => {
    let isMounted = true;
    let animId: number;
    let characterModel: THREE.Object3D | null = null;
    let mouthCtrl: MouthController | null = null;

    if (canvasDiv.current) {
      // Pastikan membersihkan canvas lama jika ada (mencegah penumpukan canvas saat HMR / remount)
      const existingCanvases = canvasDiv.current.querySelectorAll("canvas");
      existingCanvases.forEach((c) => c.remove());

      let rect = canvasDiv.current.getBoundingClientRect();
      let container = { width: rect.width, height: rect.height };
      const aspect = container.width / container.height;
      const scene = new THREE.Scene();

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
      let hasMouseMoved = false;

      const clock = new THREE.Clock();

      const light = setLighting(scene);
      let progress = setProgress((value) => setLoading(value));
      const { loadCharacter } = setCharacter(renderer, scene, camera);

      loadCharacter().then((gltf) => {
        // Guard: jika komponen sudah di-unmount saat model selesai di-load, batalkan penambahan ke scene
        if (!isMounted || !gltf) return;

        const animations = setAnimations(gltf);
        hoverDivRef.current && animations.hover(gltf, hoverDivRef.current);
        mouthCtrl = setupInteractiveSmile(gltf.scene, hoverDivRef.current);
        mixer = animations.mixer;
        let character = gltf.scene;
        characterModel = character;
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

        // Warna Kulit Karakter (Opsi 1: Sawo Matang Natural / Warm Tan Indonesian Tone)
        const skinColor = new THREE.Color("#c48958");

        // Konfigurasi Material Wajah & Bibir Kemerahan Alami (Opsi A via Shader Injection)
        const face =
          character.getObjectByName("Plane.007") ||
          character.getObjectByName("Plane007");
        if (face && (face as THREE.Mesh).isMesh) {
          configureFaceMaterial(face as THREE.Mesh, skinColor, {
            lipColor: "#b85c54", // Tone 1: Natural Warm Rosy Reddish
            creaseColor: "#7e3832", // Garis belahan bibir berdimensi
            intensity: 0.85,
            roughness: 0.40, // Sedikit lebih lembap alami dari kulit wajah
          });
        }

        // Bagian Kulit Lainnya (Telinga, Leher, Tangan)
        const otherSkinParts = [
          character.getObjectByName("Ear.001") ||
            character.getObjectByName("Ear001"),
          character.getObjectByName("Neck"),
          character.getObjectByName("Hand"),
        ];

        otherSkinParts.forEach((part) => {
          if (part && (part as THREE.Mesh).isMesh) {
            const mesh = part as THREE.Mesh;
            mesh.material = (
              mesh.material as THREE.MeshStandardMaterial
            ).clone();
            const mat = mesh.material as THREE.MeshStandardMaterial;
            mat.color.copy(skinColor);
            mat.roughness = 0.55;
          }
        });

        // Celana Pendek Hitam + Kulit Kaki Sawo Matang + Kaus Kaki Putih Realistis
        const pant = character.getObjectByName("Pant");
        if (pant && (pant as THREE.Mesh).isMesh) {
          configurePantsMaterial(pant as THREE.Mesh, skinColor);
        }
        // Pasang kerah lipatan kaos kaki 3D timbul pada tulang betis
        attachSockCuffs(character);

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
          headBone.rotation.set(-0.26, 0, 0);
          const glasses = createGlasses();
          headBone.add(glasses);
          loadCustomHair(headBone, character);
        }
        screenLight = character.getObjectByName("screenlight") || null;
        progress.loaded().then(() => {
          setTimeout(() => {
            if (!isMounted) return;
            light.turnOnLights();
            animations.startIntro();
          }, 2500);
        });
      });

      const onResize = () => {
        if (!isMounted || !characterModel) return;
        handleResize(renderer, camera, canvasDiv, characterModel);
      };
      window.addEventListener("resize", onResize);

      let mouse = { x: 0, y: 0 },
        interpolation = { x: 0.1, y: 0.2 };

      const onMouseMove = (event: MouseEvent) => {
        hasMouseMoved = true;
        handleMouseMove(event, (x, y) => (mouse = { x, y }));
      };
      let debounce: number | undefined;
      const onTouchStart = (event: TouchEvent) => {
        hasMouseMoved = true;
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

      document.addEventListener("mousemove", onMouseMove);
      const landingDiv = document.getElementById("landingDiv");
      if (landingDiv) {
        landingDiv.addEventListener("touchstart", onTouchStart);
        landingDiv.addEventListener("touchend", onTouchEnd);
      }
      const animate = () => {
        if (!isMounted) return;
        animId = requestAnimationFrame(animate);
        const delta = clock.getDelta();
        if (mixer) {
          mixer.update(delta);
        }
        if (headBone && hasMouseMoved) {
          handleHeadRotation(
            headBone,
            mouse.x,
            mouse.y,
            interpolation.x,
            interpolation.y,
            THREE.MathUtils.lerp
          );
        }
        if (screenLight) {
          light.setPointLight(screenLight);
        }
        renderer.render(scene, camera);
      };
      animate();

      return () => {
        isMounted = false;
        mouthCtrl?.cleanup();
        progress.clear();
        cancelAnimationFrame(animId);
        clearTimeout(debounce);
        scene.clear();
        renderer.dispose();
        window.removeEventListener("resize", onResize);
        document.removeEventListener("mousemove", onMouseMove);
        if (landingDiv) {
          landingDiv.removeEventListener("touchstart", onTouchStart);
          landingDiv.removeEventListener("touchend", onTouchEnd);
        }
        if (canvasDiv.current && renderer.domElement.parentNode === canvasDiv.current) {
          canvasDiv.current.removeChild(renderer.domElement);
        }
      };
    }
  }, []);

  return (
    <div className="character-container">
      <div className="character-model" ref={canvasDiv}>
        <div className="character-rim"></div>
        <div
          className="character-hover"
          ref={hoverDivRef}
          data-cursor="disable"
        ></div>
      </div>
    </div>
  );
};

export default Scene;
