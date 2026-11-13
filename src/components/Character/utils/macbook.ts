import * as THREE from "three";

// Official SVG vector path data for the Apple logo
const APPLE_SVG_PATH =
  "M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.74-11.65-14.1-5.99-9.35-10.6-19.8-13.83-31.35-3.23-11.55-4.85-22.38-4.85-32.5 0-14.24 3.65-26.1 10.96-35.58 7.31-9.48 16.48-14.28 27.5-14.4 5.22 0 10.74 1.34 16.56 4.02 5.82 2.68 9.94 4.08 12.37 4.2 1.84 0 6.07-1.47 12.69-4.41 6.62-2.94 12.56-4.3 17.82-4.08 13.59.65 24.3 5.48 32.14 14.5-12.06 7.39-17.97 17.51-17.73 30.37.24 10.02 4.16 18.42 11.76 25.21 4.78 4.24 10.38 7.33 16.79 9.27-2.6 7.82-5.97 15.65-10.11 23.49zm-34.43-108.97c0 7.82-2.83 15.22-8.49 22.18-6.74 8.04-14.89 12.83-24.47 14.35-.43-1.3-.65-2.6-.65-3.91 0-7.39 2.93-14.9 8.79-22.52 3.04-3.91 6.96-7.17 11.74-9.78 4.78-2.61 9.46-4.02 14.04-4.24.11 1.3.17 2.6.17 3.92z";

/**
 * Generates an authentic, metallic Apple Logo texture for the back of the MacBook lid.
 * Uses official vector Path2D with a sleek specular chrome/silver gradient.
 */
function createAppleLogoTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Background matching Space Grey aluminum
  ctx.fillStyle = "#52545a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  // Center logo on canvas
  ctx.translate(canvas.width / 2, canvas.height / 2);

  // Scale path so logo height is ~140px (proportional to 512px canvas)
  ctx.scale(0.9, 0.9);
  // Center of the 170x170 SVG path
  ctx.translate(-88, -89);

  // Metallic Silver / Chrome specular gradient
  const grad = ctx.createLinearGradient(20, 20, 160, 160);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.25, "#eef1f6");
  grad.addColorStop(0.55, "#c8cbd4");
  grad.addColorStop(0.8, "#e2e5ec");
  grad.addColorStop(1, "#ffffff");

  ctx.fillStyle = grad;
  ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
  ctx.shadowBlur = 8;

  const applePath = new Path2D(APPLE_SVG_PATH);
  ctx.fill(applePath);

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

/**
 * Generates a procedural CanvasTexture for the MacBook screen display.
 * Renders a high-resolution dark-mode developer IDE / VS Code with macOS window elements.
 */
function createScreenTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Editor Background (Tokyo Night / Deep Charcoal)
  ctx.fillStyle = "#14151e";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. macOS Window Title Bar
  ctx.fillStyle = "#1d1e2a";
  ctx.fillRect(0, 0, canvas.width, 38);

  // Traffic Light Buttons
  const buttons = [
    { x: 20, color: "#ff5f56" }, // Close
    { x: 38, color: "#ffbd2e" }, // Minimize
    { x: 56, color: "#27c93f" }, // Fullscreen
  ];
  buttons.forEach((btn) => {
    ctx.beginPath();
    ctx.arc(btn.x, 19, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = btn.color;
    ctx.fill();
  });

  // Tab
  ctx.fillStyle = "#14151e";
  ctx.fillRect(80, 6, 170, 32);
  ctx.fillStyle = "#a9b1d6";
  ctx.font = "13px -apple-system, BlinkMacSystemFont, 'Segoe UI', monospace";
  ctx.fillText("Portfolio.tsx", 108, 26);

  // Close tab icon
  ctx.fillStyle = "#565f89";
  ctx.fillText("✕", 228, 26);

  // 3. Sidebar (Project Explorer)
  const sidebarWidth = 190;
  ctx.fillStyle = "#101017";
  ctx.fillRect(0, 38, sidebarWidth, canvas.height - 68);

  ctx.fillStyle = "#565f89";
  ctx.font = "bold 11px sans-serif";
  ctx.fillText("EXPLORER", 16, 60);

  const files = [
    { icon: "📁", name: "src", level: 0 },
    { icon: "📁", name: "components", level: 1 },
    { icon: "⚛️", name: "Scene.tsx", level: 2 },
    { icon: "⚛️", name: "MacBook.tsx", level: 2 },
    { icon: "📄", name: "App.tsx", level: 1 },
    { icon: "🎨", name: "style.css", level: 1 },
    { icon: "⚙️", name: "config.ts", level: 0 },
  ];

  ctx.font = "12px -apple-system, monospace";
  files.forEach((file, idx) => {
    const y = 86 + idx * 24;
    const x = 16 + file.level * 14;
    ctx.fillStyle = "#7aa2f7";
    ctx.fillText(file.icon, x, y);
    ctx.fillStyle = file.name === "Portfolio.tsx" ? "#ffffff" : "#c0caf5";
    ctx.fillText(file.name, x + 20, y);
  });

  // 4. Code Area
  const codeX = sidebarWidth + 24;
  const lines = [
    { num: " 1", code: [["#bb9af7", "import "], ["#c0caf5", "{ Developer } "], ["#bb9af7", "from "], ["#9ece6a", "\"portfolio-core\""], ["#c0caf5", ";"]] },
    { num: " 2", code: [["#bb9af7", "import "], ["#c0caf5", "{ ThreeCanvas } "], ["#bb9af7", "from "], ["#9ece6a", "\"three\""], ["#c0caf5", ";"]] },
    { num: " 3", code: [] },
    { num: " 4", code: [["#7dcfff", "export const "], ["#e0af68", "AziziProfile "], ["#bb9af7", "= "], ["#c0caf5", "{"]] },
    { num: " 5", code: [["#7aa2f7", "  name"], ["#c0caf5", ": "], ["#9ece6a", "\"Azizi\""], ["#c0caf5", ","]] },
    { num: " 6", code: [["#7aa2f7", "  role"], ["#c0caf5", ": "], ["#9ece6a", "\"Senior Fullstack Architect\""], ["#c0caf5", ","]] },
    { num: " 7", code: [["#7aa2f7", "  hardware"], ["#c0caf5", ": "], ["#9ece6a", "\"MacBook Pro M-Series\""], ["#c0caf5", ","]] },
    { num: " 8", code: [["#7aa2f7", "  stack"], ["#c0caf5", ": ["], ["#9ece6a", "\"React\""], ["#c0caf5", ", "], ["#9ece6a", "\"Next.js\""], ["#c0caf5", ", "], ["#9ece6a", "\"Three.js\""], ["#c0caf5", "],"]] },
    { num: " 9", code: [["#7aa2f7", "  mission"], ["#c0caf5", ": "], ["#9ece6a", "\"Building World-Class Digital Products\""], ["#c0caf5", ""]] },
    { num: "10", code: [["#c0caf5", "};"]] },
    { num: "11", code: [] },
    { num: "12", code: [["#7dcfff", "export default function "], ["#7aa2f7", "App"], ["#c0caf5", "() {"]] },
    { num: "13", code: [["#bb9af7", "  return "], ["#7dcfff", "<"], ["#f7768e", "InteractivePortfolio "], ["#e0af68", "mode"], ["#bb9af7", "="], ["#9ece6a", "\"production\""], ["#7dcfff", " />"], ["#c0caf5", ";"]] },
    { num: "14", code: [["#c0caf5", "}"]] },
  ];

  ctx.font = "14px 'SF Mono', Menlo, Consolas, monospace";
  lines.forEach((line, idx) => {
    const y = 68 + idx * 24;
    ctx.fillStyle = "#414868";
    ctx.fillText(line.num, codeX, y);

    let offsetX = codeX + 38;
    line.code.forEach(([color, text]) => {
      ctx.fillStyle = color;
      ctx.fillText(text, offsetX, y);
      offsetX += ctx.measureText(text).width;
    });
  });

  // 5. Bottom Status Bar
  ctx.fillStyle = "#1a1b26";
  ctx.fillRect(0, canvas.height - 28, canvas.width, 28);
  ctx.fillStyle = "#7aa2f7";
  ctx.font = "11px -apple-system, sans-serif";
  ctx.fillText("⎇ main*", 16, canvas.height - 10);
  ctx.fillStyle = "#9ece6a";
  ctx.fillText("✓ TypeScript 5.5", 100, canvas.height - 10);
  ctx.fillStyle = "#a9b1d6";
  ctx.fillText("UTF-8", canvas.width - 150, canvas.height - 10);
  ctx.fillText("Ln 6, Col 18", canvas.width - 85, canvas.height - 10);

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

/**
 * Generates a procedural CanvasTexture for the MacBook Keyboard & Trackpad surface.
 */
function createKeyboardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 600;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Aluminum Chassis Surface (Space Grey)
  ctx.fillStyle = "#52545a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Speaker Grilles (Left & Right of keyboard)
  ctx.fillStyle = "#3e4046";
  const speakerWidth = 50;
  const speakerY = 40;
  const speakerHeight = 270;

  for (let y = speakerY; y < speakerY + speakerHeight; y += 6) {
    for (let x = 60; x < 60 + speakerWidth; x += 5) {
      ctx.fillRect(x, y, 1.5, 1.5);
    }
    for (let x = canvas.width - 60 - speakerWidth; x < canvas.width - 60; x += 5) {
      ctx.fillRect(x, y, 1.5, 1.5);
    }
  }

  // 3. Recessed Keyboard Well
  const kbX = 140;
  const kbY = 35;
  const kbWidth = canvas.width - 280;
  const kbHeight = 280;

  ctx.fillStyle = "#18181c";
  ctx.beginPath();
  ctx.roundRect(kbX, kbY, kbWidth, kbHeight, 8);
  ctx.fill();

  // 4. Black Chiclet Keys
  const rows = 6;
  const cols = 14;
  const keyGap = 4;
  const keyH = (kbHeight - (rows + 1) * keyGap) / rows;
  const keyW = (kbWidth - (cols + 1) * keyGap) / cols;

  ctx.fillStyle = "#0c0c0e";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === rows - 1 && c >= 4 && c <= 8) {
        if (c === 4) {
          const spacebarW = keyW * 5 + keyGap * 4;
          const kx = kbX + keyGap + c * (keyW + keyGap);
          const ky = kbY + keyGap + r * (keyH + keyGap);
          ctx.beginPath();
          ctx.roundRect(kx, ky, spacebarW, keyH, 4);
          ctx.fill();
        }
        continue;
      }

      const kx = kbX + keyGap + c * (keyW + keyGap);
      const ky = kbY + keyGap + r * (keyH + keyGap);
      ctx.beginPath();
      ctx.roundRect(kx, ky, keyW, keyH, 3);
      ctx.fill();
    }
  }

  // 5. Large Glass Force Touch Trackpad
  const tpWidth = 340;
  const tpHeight = 220;
  const tpX = (canvas.width - tpWidth) / 2;
  const tpY = kbY + kbHeight + 35;

  ctx.fillStyle = "#46484e";
  ctx.beginPath();
  ctx.roundRect(tpX, tpY, tpWidth, tpHeight, 10);
  ctx.fill();

  ctx.strokeStyle = "#383a40";
  ctx.lineWidth = 2;
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Creates a detailed 3D MacBook Pro model with custom textures.
 */
export const createMacbook = (): THREE.Group => {
  const macbook = new THREE.Group();
  macbook.name = "MacBookPro3D";

  // Base dimensions
  const width = 4.4;
  const depth = 2.6;
  const thickness = 0.08;

  // Space Grey Unibody Material
  const aluminumMaterial = new THREE.MeshStandardMaterial({
    color: 0x52545a,
    metalness: 0.82,
    roughness: 0.28,
  });

  // 1. Base Bottom & Sides Chassis
  const baseGeom = new THREE.BoxGeometry(width, thickness, depth);
  const baseMesh = new THREE.Mesh(baseGeom, aluminumMaterial);
  baseMesh.position.set(0, thickness / 2, 0);
  macbook.add(baseMesh);

  // 2. Keyboard & Trackpad Top Surface
  const kbTexture = createKeyboardTexture();
  const topSurfaceGeom = new THREE.PlaneGeometry(width * 0.99, depth * 0.99);
  const topSurfaceMat = new THREE.MeshStandardMaterial({
    map: kbTexture,
    metalness: 0.4,
    roughness: 0.5,
  });
  const topSurface = new THREE.Mesh(topSurfaceGeom, topSurfaceMat);
  topSurface.rotation.x = -Math.PI / 2;
  topSurface.position.set(0, thickness + 0.002, 0);
  macbook.add(topSurface);

  // 3. Display Lid Group (hinged at the back: z = depth / 2)
  const hingeZ = depth / 2;
  const hingeY = thickness;

  const lid = new THREE.Group();
  lid.position.set(0, hingeY, hingeZ);

  const lidHeight = 2.8;
  const lidThickness = 0.045;

  // Solid aluminum core of the lid
  const lidCoreGeom = new THREE.BoxGeometry(width, lidHeight, lidThickness);
  const lidCore = new THREE.Mesh(lidCoreGeom, aluminumMaterial);
  lidCore.position.set(0, lidHeight / 2, lidThickness / 2);
  lid.add(lidCore);

  // Back of Lid with Official Apple Logo (facing camera / viewer in +Z direction)
  const appleLogoTexture = createAppleLogoTexture();
  const backPlaneGeom = new THREE.PlaneGeometry(width, lidHeight);
  const backPlaneMat = new THREE.MeshStandardMaterial({
    map: appleLogoTexture,
    metalness: 0.82,
    roughness: 0.28,
  });
  const backPlane = new THREE.Mesh(backPlaneGeom, backPlaneMat);
  backPlane.position.set(0, lidHeight / 2, lidThickness + 0.001);
  lid.add(backPlane);

  // Front Display Surface (facing character in -Z direction)
  const screenTexture = createScreenTexture();
  const screenGeom = new THREE.PlaneGeometry(width * 0.94, lidHeight * 0.92);
  const screenMat = new THREE.MeshStandardMaterial({
    map: screenTexture,
    roughness: 0.15,
    metalness: 0.1,
    emissive: new THREE.Color(0xa0c0ff),
    emissiveIntensity: 0.65,
    emissiveMap: screenTexture,
  });
  const screen = new THREE.Mesh(screenGeom, screenMat);
  screen.rotation.y = Math.PI; // Face towards the character (-Z)
  screen.position.set(0, lidHeight / 2, -0.002);
  lid.add(screen);

  // Black Bezel around screen
  const bezelGeom = new THREE.PlaneGeometry(width * 0.98, lidHeight * 0.97);
  const bezelMat = new THREE.MeshBasicMaterial({ color: 0x050508 });
  const bezel = new THREE.Mesh(bezelGeom, bezelMat);
  bezel.rotation.y = Math.PI;
  bezel.position.set(0, lidHeight / 2, -0.001);
  lid.add(bezel);

  // Soft natural glow light cast from the screen onto the keyboard and character
  const screenLight = new THREE.PointLight(0xa5c4ff, 1.8, 7, 2);
  screenLight.name = "macbookScreenLight";
  screenLight.position.set(0, lidHeight / 2, -0.4);
  lid.add(screenLight);

  // Open angle (~105 degrees open from base, slightly tilted back towards +Z)
  lid.rotation.x = 0.28;

  macbook.add(lid);

  // Optimize shadows
  macbook.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = false;
      child.receiveShadow = false;
    }
  });

  return macbook;
};

export default createMacbook;
