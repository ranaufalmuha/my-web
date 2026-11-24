"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import * as THREE from "three";
import { cn } from "@/shared/lib/utils";

export interface ConcaveCarouselItem {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  href?: string;
}

export interface ConcaveCarouselWallText {
  texts: string[];
  /** Seconds each text stays up. Default 2.6 */
  interval?: number;
  /** Cap height of the text on the wall, in wall units (panel height = 1). Default 0.16 */
  size?: number;
  /** Vertical centre of the text on the wall; the pictures span -0.5 to 0.5.
   * Default: one card gap above the pictures. */
  y?: number;
  /** Fill colour, as a CSS colour string. Default "#ebebeb" */
  color?: string;
  /** CSS font-family for the text; defaults to the page's own body font. */
  font?: string;
  /** CSS font-family for the first word of each text. Defaults to `font`. */
  accentFont?: string;
}

export interface ConcaveCarouselWallAction {
  /** Text painted on the pill. */
  label: string;
  /** Where the pill links to. */
  href: string;
  /** Pill height in wall units (panel height = 1). Default 0.16 */
  size?: number;
  /** Centre of the pill along the wall, in card widths.
   * Default: right-aligned to the cards. */
  x?: number;
  /** Fill colour. Default: the site's --color-primary. */
  color?: string;
  /** CSS font-family for the label; defaults to the page's body font. */
  font?: string;
}

export type ConcaveCarouselAutoplay = "drift" | "step" | "off";

export interface ConcaveCarouselProps {
  items?: ConcaveCarouselItem[];
  startIndex?: number;
  aspect?: number;
  size?: number;
  curvature?: number;
  distance?: number;
  tilt?: number;
  pointerTilt?: number;
  gap?: number;
  radius?: number;
  reflection?: number;
  grayscale?: number;
  dim?: number;
  autoplay?: ConcaveCarouselAutoplay;
  speed?: number;
  interval?: number;
  snap?: boolean;
  inertia?: number;
  pauseOnHover?: boolean;
  draggable?: boolean;
  wheel?: boolean;
  captions?: boolean;
  controls?: boolean;
  backgroundColor?: string;
  paused?: boolean;
  dpr?: number;
  wallText?: ConcaveCarouselWallText;
  wallAction?: ConcaveCarouselWallAction;
  ariaLabel?: string;
  onIndexChange?: (index: number) => void;
  onSelect?: (item: ConcaveCarouselItem, index: number) => void;
  className?: string;
  style?: CSSProperties;
}

export interface ConcaveCarouselHandle {
  next: () => void;
  previous: () => void;
  goTo: (index: number) => void;
}

type Settings = Required<
  Omit<
    ConcaveCarouselProps,
    | "className"
    | "style"
    | "onIndexChange"
    | "onSelect"
    | "ariaLabel"
    | "startIndex"
    | "items"
    | "wallText"
    | "wallAction"
  >
> & {
  reduced: boolean;
  held: boolean;
  wallText?: ConcaveCarouselWallText;
  wallAction?: ConcaveCarouselWallAction;
};

interface Controller {
  sync: () => void;
  step: (direction: number) => void;
  goTo: (index: number) => void;
  destroy: () => void;
}

interface Callbacks {
  onActive: (index: number) => void;
  onSelect: (index: number) => void;
  onLayout: (controlsTop: number) => void;
}

interface Picture {
  image: HTMLImageElement;
  texture: THREE.Texture;
  aspect: number;
  ready: boolean;
  uploaded: boolean;
  fade: number;
}

interface Panel {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  mirror: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
}

const SLOTS = 28;
const LABELS = 5;
const MAX_ANGLE = (52 * Math.PI) / 180;
const FLOOR_GAP = 0.035;
const LABEL_GAP = 28;
const LABEL_HEIGHT = 42;
const CONTROL_GAP = 34;
const CONTROL_HEIGHT = 32;
const TAU = Math.PI * 2;

const defaultItems: ConcaveCarouselItem[] = [
  ["https://pro.reactbits.dev/demo-media/architecture-drum.webp", "Drum", "A round form in blue"],
  ["https://pro.reactbits.dev/demo-media/architecture-spires.webp", "Spires", "Points against the sky"],
  ["https://pro.reactbits.dev/demo-media/architecture-vault.webp", "Vault", "Ribs of light"],
  ["https://pro.reactbits.dev/demo-media/architecture-balconies.webp", "Balconies", "Glass and white walls"],
  ["https://pro.reactbits.dev/demo-media/architecture-lattice.webp", "Lattice", "A facade climbing into blue"],
  ["https://pro.reactbits.dev/demo-media/architecture-courtyard.webp", "Courtyard", "Two pines, one wall"],
  ["https://pro.reactbits.dev/demo-media/architecture-stair.webp", "Sunlit stair", "Light climbing a quiet wall"],
  ["https://pro.reactbits.dev/demo-media/architecture-monolith.webp", "Monolith", "Concrete in rhythm"],
].map(([src, title, subtitle]) => ({
  src,
  alt: `${title}, ${subtitle.toLowerCase()}`,
  title,
  subtitle,
}));

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const subscribeToMotion = (notify: () => void) => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};

const readMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const parseColor = (value: string) => {
  const hex = value.trim().replace("#", "");
  if (!/^[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(hex)) return null;
  const full = hex.length === 3 ? hex.replace(/./g, (c) => c + c) : hex;
  return [0, 2, 4].map((offset) => Number.parseInt(full.slice(offset, offset + 2), 16) / 255);
};

const isLight = (value: string) => {
  const rgb = parseColor(value);
  if (!rgb) return false;
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2] > 0.6;
};

const springTo = (
  value: number,
  velocity: number,
  target: number,
  dt: number,
  response: number,
  ratio: number,
) => {
  const omega = TAU / Math.max(response, 0.02);
  const substeps = Math.max(1, Math.ceil(dt / (1 / 240)));
  const h = dt / substeps;
  let v = velocity;
  let x = value;
  for (let i = 0; i < substeps; i++) {
    v += (omega * omega * (target - x) - 2 * ratio * omega * v) * h;
    x += v * h;
  }
  return [x, v] as const;
};

const hiddenStyle: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

const stageStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  touchAction: "pan-y",
  userSelect: "none",
  WebkitUserSelect: "none",
  WebkitTouchCallout: "none",
};

const raised = "color-mix(in oklch, currentColor 10%, transparent)";
const raisedHover = "color-mix(in oklch, currentColor 17%, transparent)";

const labelLayerStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  overflow: "hidden",
  pointerEvents: "none",
};

const controlStyle: CSSProperties = {
  width: 32,
  height: 32,
  display: "grid",
  placeItems: "center",
  padding: 0,
  borderRadius: 999,
  border: 0,
  background: raised,
  color: "inherit",
  cursor: "pointer",
  pointerEvents: "auto",
  transition: "background-color 160ms ease",
};

const vertexShader = `
uniform float uCenter;
uniform float uWidth;
uniform float uK;
uniform float uFloor;
uniform float uMirror;
uniform float uHeight;
uniform float uY;
varying vec2 vUv;
varying float vLift;

void main() {
  vUv = uv;
  float s = uCenter + (uv.x - 0.5) * uWidth;
  float y = (uv.y - 0.5) * uHeight + uY;
  float x = s;
  float z = 0.0;
  if (uK > 1e-5) {
    float a = s * uK;
    float h = sin(a * 0.5);
    x = sin(a) / uK;
    z = 2.0 * h * h / uK;
  }
  vLift = y - uFloor;
  if (uMirror > 0.5) y = 2.0 * uFloor - y;
  gl_Position = projectionMatrix * viewMatrix * vec4(x, y, z, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform sampler2D uImage;
uniform float uImageAspect;
uniform float uWidth;
uniform float uRadius;
uniform float uLoaded;
uniform float uAlpha;
uniform float uMirror;
uniform float uReflect;
uniform float uDim;
uniform float uHover;
uniform float uGray;
uniform vec2 uResolution;
uniform vec3 uPlaceholder;
varying vec2 vUv;
varying float vLift;

float roundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  vec2 size = vec2(uWidth, 1.0);
  vec2 p = (vUv - 0.5) * size;
  float lift = max(vLift, 0.0);
  float mirror = step(0.5, uMirror);
  float soft = 1.0 + mirror * lift * 26.0;
  float d = roundBox(p, size * 0.5, min(uRadius, 0.5 * min(size.x, size.y)));
  float aa = max(fwidth(d), 1e-5) * 0.7 * soft;
  float mask = 1.0 - smoothstep(-aa, aa, d);

  float fade = mix(1.0, uReflect * pow(1.0 - clamp(lift / 0.62, 0.0, 1.0), 2.2), mirror);
  float edge = abs(gl_FragCoord.x / uResolution.x * 2.0 - 1.0);
  float vignette = 1.0 - uDim * smoothstep(0.18, 1.05, edge) * (1.0 - 0.85 * uHover);
  float alpha = mask * fade * vignette * uAlpha;
  if (alpha < 0.002) discard;

  float panelAspect = size.x / size.y;
  vec2 uv = vUv - 0.5;
  if (panelAspect > uImageAspect) {
    uv.y *= uImageAspect / panelAspect;
  } else {
    uv.x *= panelAspect / uImageAspect;
  }
  uv += 0.5;
  float blur = 1.0 + mirror * lift * 30.0;
  vec3 color = textureGrad(uImage, uv, dFdx(uv) * blur, dFdy(uv) * blur).rgb;

  float loaded = clamp(uLoaded, 0.0, 1.0);
  vec3 rgb = mix(uPlaceholder, color, loaded);
  float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
  rgb = mix(vec3(luma), rgb, mix(1.0 - uGray, 1.0, uHover));
  alpha *= mix(0.08, 1.0, loaded);
  gl_FragColor = vec4(rgb * alpha, alpha);
}
`;

const textFragmentShader = `
precision highp float;

uniform sampler2D uMap;
uniform vec3 uColor;
uniform float uAlpha;
varying vec2 vUv;

void main() {
  float a = texture2D(uMap, vUv).a * uAlpha;
  if (a < 0.004) discard;
  gl_FragColor = vec4(uColor * a, a);
}
`;

const actionFragmentShader = `
precision highp float;

uniform sampler2D uMap;
uniform float uAlpha;
varying vec2 vUv;

void main() {
  vec4 c = texture2D(uMap, vUv);
  float a = c.a * uAlpha;
  if (a < 0.004) discard;
  gl_FragColor = vec4(c.rgb * uAlpha, a);
}
`;

let rgbContext: CanvasRenderingContext2D | null = null;

const toRgb = (value: string) => {
  if (!value || /^rgba?\(/i.test(value)) return value;
  if (!rgbContext) rgbContext = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!rgbContext) return value;
  rgbContext.fillStyle = "#010203";
  rgbContext.fillStyle = value;
  if (String(rgbContext.fillStyle) === "#010203" && value.trim().toLowerCase() !== "#010203") return value;
  rgbContext.clearRect(0, 0, 1, 1);
  rgbContext.fillRect(0, 0, 1, 1);
  const pixel = rgbContext.getImageData(0, 0, 1, 1).data;
  return pixel[3] === 255
    ? `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`
    : `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${Math.round((pixel[3] / 255) * 1000) / 1000})`;
};

const createRotunda = (
  root: HTMLElement,
  stage: HTMLElement,
  labelHost: HTMLElement,
  settingsRef: { current: Settings },
  itemsRef: { current: ConcaveCarouselItem[] },
  startIndex: number,
  callbacks: Callbacks,
): Controller | null => {
  const doc = root.ownerDocument;
  const canvas = doc.createElement("canvas");
  canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });
  } catch {
    return null;
  }
  stage.appendChild(canvas);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.02, 400);
  const geometry = new THREE.PlaneGeometry(1, 1, 72, 1);
  const blank = new THREE.DataTexture(new Uint8Array([128, 128, 128, 255]), 1, 1);
  blank.needsUpdate = true;
  const resolution = new THREE.Vector2(1, 1);
  const placeholder = new THREE.Color(1, 1, 1);
  const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const makeMaterial = (mirror: boolean) =>
    new THREE.ShaderMaterial({
      uniforms: {
        uImage: { value: blank as THREE.Texture },
        uImageAspect: { value: 1.5 },
        uCenter: { value: 0 },
        uWidth: { value: 1.3 },
        uK: { value: 0.3 },
        uHeight: { value: 1 },
        uY: { value: 0 },
        uFloor: { value: -0.5 - FLOOR_GAP },
        uMirror: { value: mirror ? 1 : 0 },
        uRadius: { value: 0.04 },
        uLoaded: { value: 0 },
        uAlpha: { value: 1 },
        uReflect: { value: 0 },
        uDim: { value: 0 },
        uHover: { value: 0 },
        uGray: { value: 0 },
        uResolution: { value: resolution },
        uPlaceholder: { value: placeholder },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      premultipliedAlpha: true,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

  const panels: Panel[] = Array.from({ length: SLOTS }, () => {
    const mirror = new THREE.Mesh(geometry, makeMaterial(true));
    const mesh = new THREE.Mesh(geometry, makeMaterial(false));
    mirror.frustumCulled = false;
    mesh.frustumCulled = false;
    mirror.visible = false;
    mesh.visible = false;
    mirror.renderOrder = 0;
    mesh.renderOrder = 1;
    scene.add(mirror);
    scene.add(mesh);
    return { mesh, mirror };
  });

  const labels = Array.from({ length: LABELS }, () => {
    const node = doc.createElement("div");
    node.setAttribute("aria-hidden", "true");
    node.style.cssText =
      "position:absolute;left:0;top:0;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center;white-space:nowrap;opacity:0;pointer-events:none;will-change:transform,opacity";
    const title = doc.createElement("span");
    title.style.cssText = "font-size:15px;font-weight:600;line-height:1.3;letter-spacing:-0.01em";
    const subtitle = doc.createElement("span");
    subtitle.style.cssText = "font-size:13px;opacity:0.55;line-height:1.4";
    node.append(title, subtitle);
    labelHost.appendChild(node);
    return { node, title, subtitle, index: Number.NaN, opacity: -1, x: Number.NaN, y: Number.NaN };
  });

  // ---- text painted on the same cylindrical wall as the pictures ----
  const TEXT_FONT = 128;
  const textCanvas = doc.createElement("canvas");
  const textCtx = textCanvas.getContext("2d");
  const textTexture = new THREE.CanvasTexture(textCanvas);
  textTexture.colorSpace = THREE.NoColorSpace;
  textTexture.premultiplyAlpha = true;
  textTexture.minFilter = THREE.LinearFilter;
  textTexture.magFilter = THREE.LinearFilter;
  textTexture.generateMipmaps = false;
  const textMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: textTexture },
      uColor: { value: new THREE.Color(1, 1, 1) },
      uAlpha: { value: 0 },
      uCenter: { value: 0 },
      uWidth: { value: 1 },
      uHeight: { value: 0.16 },
      uY: { value: 0.66 },
      uK: { value: 0.3 },
      uFloor: { value: -0.5 },
      uMirror: { value: 0 },
    },
    vertexShader,
    fragmentShader: textFragmentShader,
    transparent: true,
    premultipliedAlpha: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const textMesh = new THREE.Mesh(geometry, textMaterial);
  const textScratch = new THREE.Vector3();
  textMesh.frustumCulled = false;
  textMesh.visible = false;
  textMesh.renderOrder = 2;
  scene.add(textMesh);

  // ---- one wall button under the pictures, right-aligned to the cards ----
  const ACT_FONT = 128;
  const actCanvas = doc.createElement("canvas");
  const actCtx = actCanvas.getContext("2d");
  const actTexture = new THREE.CanvasTexture(actCanvas);
  actTexture.colorSpace = THREE.NoColorSpace;
  actTexture.premultiplyAlpha = true;
  actTexture.minFilter = THREE.LinearFilter;
  actTexture.magFilter = THREE.LinearFilter;
  actTexture.generateMipmaps = false;
  const actMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: actTexture },
      uAlpha: { value: 0 },
      uCenter: { value: 0 },
      uWidth: { value: 1 },
      uHeight: { value: 0.16 },
      uY: { value: -0.7 },
      uK: { value: 0.3 },
      uFloor: { value: -0.5 },
      uMirror: { value: 0 },
    },
    vertexShader,
    fragmentShader: actionFragmentShader,
    transparent: true,
    premultipliedAlpha: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const actMesh = new THREE.Mesh(geometry, actMaterial);
  actMesh.frustumCulled = false;
  actMesh.visible = false;
  actMesh.renderOrder = 3;
  scene.add(actMesh);

  let actKey = "";
  let actPainted = "";
  let actWidth = 1;
  let actHover = false;

  // A real link sits over the painted pill, so it stays keyboard and AT friendly.
  const actLink = doc.createElement("a");
  // Colour transparent: the pill is painted on the wall, the link only needs the hit box.
  actLink.style.cssText =
    "position:absolute;left:0;top:0;width:0;height:0;opacity:0;pointer-events:none;outline-offset:-2px;color:transparent;text-decoration:none;overflow:hidden;will-change:opacity,clip-path";
  actLink.addEventListener("pointerenter", () => {
    actHover = true;
    schedule();
  });
  actLink.addEventListener("pointerleave", () => {
    actHover = false;
    schedule();
  });
  // Pointerdown would start the drag; a click would also select a card.
  actLink.addEventListener("pointerdown", (event) => event.stopPropagation());
  actLink.addEventListener("click", (event) => event.stopPropagation());
  stage.appendChild(actLink);

  let textKey = "";
  let textWidth = 1;
  let textIndex = 0;
  let textSince = 0;
  let textSwaps = 0;
  let textPainted = "";

  let inheritedFamily = "";
  const textFamily = () =>
    settingsRef.current.wallText?.font ??
    (inheritedFamily ||= getComputedStyle(root).fontFamily || "sans-serif");

  let baseFont = "";
  let accentFont = "";
  let textPad = 0;

  // First word gets the accent face, the rest the body face.
  const splitHead = (text: string) => {
    const at = text.indexOf(" ");
    return at < 0 ? [text, ""] : [text.slice(0, at), text.slice(at)];
  };

  const measureLine = (text: string) => {
    if (!textCtx) return 0;
    const [head, tail] = splitHead(text);
    textCtx.font = accentFont;
    const headWidth = textCtx.measureText(head).width;
    textCtx.font = baseFont;
    return headWidth + (tail ? textCtx.measureText(tail).width : 0);
  };

  const fitTextCanvas = () => {
    if (!textCtx) return;
    // Canvas cannot inherit CSS, so read the page's own type off the root.
    const weight = getComputedStyle(root).fontWeight || 400;
    baseFont = `${weight} ${TEXT_FONT}px ${textFamily()}`;
    accentFont = `${weight} ${TEXT_FONT}px ${settingsRef.current.wallText?.accentFont ?? textFamily()}`;
    const texts = settingsRef.current.wallText?.texts ?? [];
    const widest = texts.reduce((max, text) => Math.max(max, measureLine(text)), 0);
    textCanvas.width = Math.max(2, Math.ceil(widest + TEXT_FONT * 0.4));
    textCanvas.height = Math.ceil(TEXT_FONT * 1.6);
    textCtx.textBaseline = "alphabetic";
    textCtx.textAlign = "left";
    textCtx.fillStyle = "#ffffff";
    // The baseline sits at the canvas middle; this is the ink below it,
    // as a fraction of the plane height.
    let descent = 0;
    for (const text of texts) {
      for (const font of [accentFont, baseFont]) {
        textCtx.font = font;
        descent = Math.max(descent, textCtx.measureText(text).actualBoundingBoxDescent || 0);
      }
    }
    textPad = textCanvas.height ? descent / textCanvas.height : 0;
    const size = settingsRef.current.wallText?.size ?? 0.16;
    textWidth = (size * textCanvas.width) / textCanvas.height;
  };

  const layoutText = () => {
    const texts = settingsRef.current.wallText?.texts ?? [];
    const key = `${texts.join("\u0000")}|${settingsRef.current.wallText?.size ?? 0.16}|${settingsRef.current.wallText?.accentFont ?? ""}`;
    if (key === textKey) return;
    textKey = key;
    textIndex = 0;
    textSince = 0;
    textSwaps = 0;
    if (!texts.length || !textCtx) {
      textMesh.visible = false;
      return;
    }
    fitTextCanvas();
    textPainted = "";
    textTexture.needsUpdate = true;
    // Redraw once the webfont lands; canvas falls back silently until then.
    const family = settingsRef.current.wallText?.accentFont ?? textFamily();
    doc.fonts?.load(`${TEXT_FONT}px ${family}`).then(() => {
      if (destroyed) return;
      fitTextCanvas();
      textPainted = "";
      textTexture.needsUpdate = true;
      schedule();
    });
  };

  // Draws the current text pair into the canvas; returns 1 while a crossfade runs.
  const paintText = (now: number) => {
    const wall = settingsRef.current.wallText;
    const texts = wall?.texts ?? [];
    if (!wall || !textCtx || !texts.length) return 0;
    const interval = Math.max(wall.interval ?? 2.6, 0.8);
    if (!textSince) textSince = now;
    if (now - textSince >= interval) {
      textIndex = (textIndex + 1) % texts.length;
      textSince = now;
      textSwaps += 1;
    }
    const t = clamp((now - textSince) / 0.45, 0, 1);
    const ease = t * t * (3 - 2 * t);
    const outgoing = (textIndex + texts.length - 1) % texts.length;
    const paintKey = `${textIndex}|${t < 1 ? Math.round(t * 60) : 120}`;
    if (paintKey === textPainted) return t < 1 ? 1 : 0;
    textPainted = paintKey;
    textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
    const paint = (index: number, alpha: number, dy: number) => {
      if (!textCtx) return;
      const [head, tail] = splitHead(texts[index]);
      textCtx.font = accentFont;
      const headWidth = textCtx.measureText(head).width;
      textCtx.font = baseFont;
      const tailWidth = tail ? textCtx.measureText(tail).width : 0;
      const left = (textCanvas.width - headWidth - tailWidth) / 2;
      const y = textCanvas.height / 2 + dy;
      textCtx.globalAlpha = alpha;
      textCtx.font = accentFont;
      textCtx.fillText(head, left, y);
      if (tail) {
        textCtx.font = baseFont;
        textCtx.fillText(tail, left + headWidth, y);
      }
    };
    if (t < 1 && textSwaps > 0) {
      paint(outgoing, 1 - ease, -ease * textCanvas.height * 0.1);
      paint(textIndex, ease, (1 - ease) * textCanvas.height * 0.3);
    } else {
      paint(textIndex, 1, 0);
    }
    textCtx.globalAlpha = 1;
    textTexture.needsUpdate = true;
    return t < 1 ? 1 : 0;
  };

  const fitAction = () => {
    const action = settingsRef.current.wallAction;
    if (!actCtx || !action) return false;
    const key = `${action.label}|${action.href}|${action.size ?? 0.16}`;
    if (key !== actKey) {
      actKey = key;
      actLink.href = action.href;
      actLink.textContent = action.label;
      // Same box as the site button: 2em side padding, 16px text in a 40px box.
      actCtx.font = `400 ${ACT_FONT}px ${action.font ?? textFamily()}`;
      actCanvas.width = Math.max(2, Math.ceil(actCtx.measureText(action.label).width + ACT_FONT * 4));
      actCanvas.height = Math.ceil(ACT_FONT * 2.5);
      actWidth = ((action.size ?? 0.16) * actCanvas.width) / actCanvas.height;
      actPainted = "";
    }
    return true;
  };

  const paintAction = () => {
    const action = settingsRef.current.wallAction;
    if (!actCtx || !action || !fitAction()) return;
    const key = `${actKey}|${actHover ? 1 : 0}`;
    if (key === actPainted) return;
    actPainted = key;
    const w = actCanvas.width;
    const h = actCanvas.height;
    const css = getComputedStyle(root);
    actCtx.clearRect(0, 0, w, h);
    actCtx.fillStyle = action.color?.trim() || css.getPropertyValue("--color-primary").trim() || "#ebebeb";
    actCtx.fillRect(0, 0, w, h);
    if (actHover) {
      // Same white sheen the site button gets on hover.
      actCtx.fillStyle = "rgba(255,255,255,0.12)";
      actCtx.fillRect(0, 0, w, h);
    }
    actCtx.font = `400 ${ACT_FONT}px ${action.font ?? textFamily()}`;
    actCtx.textAlign = "center";
    actCtx.textBaseline = "middle";
    actCtx.fillStyle = css.color || "#ebebeb";
    actCtx.fillText(action.label, w / 2, h / 2 + ACT_FONT * 0.06);
    actTexture.needsUpdate = true;
  };

  let pictures: Picture[] = [];
  let itemsKey = "";
  let width = 0;
  let height = 0;
  let dpr = 1;
  let sized = false;
  let pos = startIndex;
  let vel = 0;
  let momentum = 0;
  let target: number | null = startIndex;
  let brake = 1;
  let holdUntil = 0;
  let wheelAt = 0;
  let wheeling = false;
  let nextStepAt = 0;
  let intro = 0;
  let introFrom = 0;
  let started = false;
  let waitedSince = 0;
  let raf = 0;
  let timer = 0;
  let last = 0;
  let visible = false;
  let destroyed = false;
  let lost = false;
  let consumed = false;
  let pointerInside = false;
  let hovered: number | null = null;
  // camera orbit from cursor position (true 3D rotation, not a CSS tilt)
  let orbitX = 0;
  let orbitY = 0;
  let orbitTargetX = 0;
  let orbitTargetY = 0;
  const hoverMix = new Map<number, number>();
  let reportedActive = Number.NaN;
  let reportedTop = Number.NaN;
  let press: {
    id: number;
    x: number;
    y: number;
    grab: number;
    origin: number;
    moved: boolean;
    samples: { t: number; p: number }[];
  } | null = null;

  const geo = {
    labelGap: LABEL_GAP,
    controlsTop: LABEL_GAP,
    unit: 1,
    pitch: 1.3,
    width: 1.25,
    k: 0.3,
    distance: 2.2,
    lift: 0,
    radius: 0.04,
  };

  const count = () => Math.max(itemsRef.current.length, 1);
  const wrap = (index: number) => ((index % count()) + count()) % count();

  const loadPictures = () => {
    const items = itemsRef.current;
    const key = items.map((item) => item.src).join("\u0000");
    if (key === itemsKey) return;
    itemsKey = key;
    labels.forEach((label) => {
      label.index = Number.NaN;
    });
    pictures.forEach((picture) => {
      picture.image.onload = null;
      picture.texture.dispose();
    });
    const n = Math.max(items.length, 1);
    const centre = wrap(Math.round(pos));
    pictures = items.map((item, index) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.decoding = "async";
      const apart = Math.abs(index - centre) % n;
      image.fetchPriority = Math.min(apart, n - apart) <= 2 ? "high" : "low";
      const texture = new THREE.Texture(image);
      texture.colorSpace = THREE.NoColorSpace;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.anisotropy = anisotropy;
      const picture: Picture = {
        image,
        texture,
        aspect: 1.5,
        ready: false,
        uploaded: false,
        fade: 0,
      };
      image.onload = () => {
        if (destroyed) return;
        picture.aspect = image.naturalWidth / Math.max(image.naturalHeight, 1);
        picture.ready = true;
        texture.needsUpdate = true;
        schedule();
      };
      image.src = item.src;
      return picture;
    });
  };

  const readSize = () => {
    const settings = settingsRef.current;
    const nextWidth = Math.round(root.clientWidth);
    const nextHeight = Math.round(root.clientHeight);
    if (nextWidth < 2 || nextHeight < 2) {
      sized = false;
      return false;
    }
    const nextDpr = Math.min(window.devicePixelRatio || 1, Math.max(settings.dpr, 0.5));
    if (sized && nextWidth === width && nextHeight === height && nextDpr === dpr) return false;
    sized = true;
    width = nextWidth;
    height = nextHeight;
    dpr = nextDpr;
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    resolution.set(width * dpr, height * dpr);
    return true;
  };

  const measure = () => {
    const settings = settingsRef.current;
    const rhythm = clamp(height / 620, 0.72, 1.15);
    const labelGap = LABEL_GAP * rhythm;
    const controlsTop = settings.captions ? labelGap + LABEL_HEIGHT + CONTROL_GAP * rhythm : labelGap;
    const reserve = settings.controls
      ? controlsTop + CONTROL_HEIGHT
      : settings.captions
        ? labelGap + LABEL_HEIGHT
        : 0;
    geo.labelGap = labelGap;
    geo.controlsTop = controlsTop;
    const room = Math.max(height - reserve, height * 0.55);
    const aspect = clamp(settings.aspect, 0.4, 3.5);
    let unit = clamp(settings.size, 0.15, 0.95) * room;
    const distance = clamp(settings.distance, 0.9, 12);
    const maxSpan = Math.tan((62 * Math.PI) / 180);
    const spanFor = (u: number) => (width / u / 2) / distance;
    if (spanFor(unit) > maxSpan) unit = width / 2 / distance / maxSpan;
    // The card height only follows the viewport height, so phones would get
    // full-size cards; shrink the drum instead.
    unit *= clamp(width / 640, 0.72, 1);
    const gapWorld = Math.max(0, settings.gap) / unit;
    geo.unit = unit;
    geo.width = aspect;
    geo.pitch = aspect + gapWorld;
    geo.k = (clamp(settings.curvature, 0, 1) * MAX_ANGLE) / geo.pitch;
    geo.distance = distance;
    geo.radius = Math.max(0, settings.radius) / unit;
    const tilt = (clamp(settings.tilt, -30, 30) * Math.PI) / 180;
    const fov = 2 * Math.atan(height / 2 / unit / distance);
    camera.fov = (fov * 180) / Math.PI;
    camera.aspect = width / height;
    camera.near = Math.max(0.01, distance * 0.02);
    camera.far = distance + 200;
    camera.position.set(
      Math.sin(orbitY) * distance,
      Math.tan(tilt) * distance + Math.sin(orbitX) * distance * 0.6,
      Math.cos(orbitY) * distance,
    );
    camera.lookAt(0, 0, 0);
    camera.clearViewOffset();
    camera.updateMatrixWorld();
    const centreTop = screenY(0, 0.5);
    const centreBottom = screenY(0, -0.5);
    const rim = rayHit(0.75, 0);
    const top = rim ? Math.min(screenY(rim.s, 0.5), centreTop) : centreTop;
    const bottom = reserve > 0 ? centreBottom + reserve : rim ? screenY(rim.s, -0.5) : centreBottom;
    geo.lift = clamp((top - (height - bottom)) / 2, -height * 0.25, height * 0.25);
    camera.setViewOffset(width, height, 0, geo.lift, width, height);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  };

  const wallPoint = (s: number, y: number, out: THREE.Vector3) => {
    const k = geo.k;
    if (k > 1e-5) {
      const a = s * k;
      const h = Math.sin(a / 2);
      out.set(Math.sin(a) / k, y, (2 * h * h) / k);
    } else {
      out.set(s, y, 0);
    }
    return out;
  };

  const scratch = new THREE.Vector3();
  const facing = (s: number) => {
    const k = geo.k;
    if (k <= 1e-5) return true;
    const r = 1 / k;
    return r + (geo.distance - r) * Math.cos(s * k) > 0.02 * r;
  };

  const screenX = (s: number) => {
    wallPoint(s, 0, scratch).project(camera);
    return scratch.z > 1 ? Number.NaN : scratch.x;
  };

  const screenY = (s: number, y: number) => {
    wallPoint(s, y, scratch).project(camera);
    return ((1 - scratch.y) / 2) * height;
  };

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const hitAt = (clientX: number, clientY: number) => {
    const rect = root.getBoundingClientRect();
    return rayHit(
      ((clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1,
      1 - ((clientY - rect.top) / Math.max(rect.height, 1)) * 2,
    );
  };

  const rayHit = (ndcX: number, ndcY: number) => {
    pointer.set(ndcX, ndcY);
    raycaster.setFromCamera(pointer, camera);
    const o = raycaster.ray.origin;
    const d = raycaster.ray.direction;
    const k = geo.k;
    if (k <= 1e-5) {
      if (Math.abs(d.z) < 1e-6) return null;
      const t = -o.z / d.z;
      if (t <= 0) return null;
      return { s: o.x + t * d.x, y: o.y + t * d.y };
    }
    const r = 1 / k;
    const px = o.x;
    const pz = o.z - r;
    const a = d.x * d.x + d.z * d.z;
    if (a < 1e-9) return null;
    const b = 2 * (px * d.x + pz * d.z);
    const c = px * px + pz * pz - r * r;
    const disc = b * b - 4 * a * c;
    if (disc < 0) return null;
    const t = (-b + Math.sqrt(disc)) / (2 * a);
    if (t <= 0) return null;
    const x = o.x + t * d.x;
    const z = o.z + t * d.z;
    return { s: Math.atan2(x, r - z) * r, y: o.y + t * d.y };
  };

  const panelAt = (clientX: number, clientY: number) => {
    const hit = hitAt(clientX, clientY);
    if (!hit) return null;
    const index = Math.round(hit.s / geo.pitch + pos);
    const local = hit.s - (index - pos) * geo.pitch;
    if (Math.abs(local) > geo.width / 2 || Math.abs(hit.y) > 0.5) return null;
    if (!facing(hit.s)) return null;
    return index;
  };

  const schedule = () => {
    if (destroyed || lost || !visible || raf) return;
    if (timer) {
      window.clearTimeout(timer);
      timer = 0;
    }
    raf = requestAnimationFrame(frame);
  };

  const clock = () => performance.now() / 1000;

  const hold = (seconds = 2.4) => {
    const at = clock();
    holdUntil = Math.max(holdUntil, at + seconds);
    nextStepAt = Math.max(nextStepAt, at + Math.max(settingsRef.current.interval, seconds));
  };

  const goTo = (index: number) => {
    const n = count();
    const base = Math.round(target ?? pos);
    const offset = ((((index - wrap(base)) % n) + n + Math.floor(n / 2)) % n) - Math.floor(n / 2);
    target = base + offset;
    hold();
    schedule();
  };

  const step = (direction: number) => {
    target = Math.round(target ?? pos) + direction;
    hold();
    schedule();
  };

  const uploadOne = () => {
    const n = pictures.length;
    const centre = wrap(Math.round(pos));
    let best: Picture | null = null;
    let bestDistance = Infinity;
    for (let i = 0; i < n; i++) {
      const picture = pictures[i];
      if (!picture.ready || picture.uploaded) continue;
      const apart = Math.abs(i - centre) % n;
      const distance = Math.min(apart, n - apart);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = picture;
      }
    }
    if (!best) return false;
    renderer.initTexture(best.texture);
    best.uploaded = true;
    return true;
  };

  function frame(time: number) {
    raf = 0;
    if (destroyed || lost) return;
    if (!sized) {
      readSize();
      if (!sized) return;
      measure();
    }
    const settings = settingsRef.current;
    const dt = last && time - last < 100 ? Math.min(Math.max((time - last) / 1000, 0), 0.05) : 1 / 60;
    last = time;
    const now = clock();
    const reduced = settings.reduced;
    let busy = false;

    if (!started) {
      if (!waitedSince) waitedSince = now;
      let ready = true;
      for (let offset = -2; offset <= 2; offset++) {
        const picture = pictures[wrap(Math.round(pos) + offset)];
        if (picture && !picture.uploaded) ready = false;
      }
      if (ready || reduced || now - waitedSince > 1.6) {
        started = true;
        introFrom = reduced ? 0 : -1.6;
        intro = reduced ? 1 : 0;
      } else {
        busy = true;
      }
    }
    if (started && intro < 1) {
      intro = Math.min(1, intro + dt / 2.2);
      busy = true;
    }
    const introEase = 1 - Math.pow(1 - intro, 4);

    if (uploadOne()) busy = true;
    for (const picture of pictures) {
      if (picture.uploaded && picture.fade < 1) {
        picture.fade = reduced || !started ? 1 : Math.min(1, picture.fade + dt / 0.5);
        busy = true;
      }
    }

    const autoplay = settings.autoplay;
    const interval = Math.max(settings.interval, 0.8);
    const stopped = settings.paused || settings.held || reduced || autoplay === "off";
    const touching = !!press || (settings.pauseOnHover && pointerInside);
    const holding = touching || now < holdUntil;
    const brakeTarget = stopped || holding || autoplay !== "drift" ? 0 : 1;
    const brakeTau = brakeTarget > brake ? 0.9 : 0.32;
    brake += (brakeTarget - brake) * (1 - Math.exp(-dt / brakeTau));
    if (Math.abs(brakeTarget - brake) > 1e-3) busy = true;
    else brake = brakeTarget;

    if (autoplay === "step" && !stopped && count() > 1) {
      if (touching || nextStepAt === 0) nextStepAt = Math.max(nextStepAt, now + interval * 0.6);
      else if (now >= nextStepAt && !holding) {
        nextStepAt = now + interval;
        target = Math.round(target ?? pos) + (settings.speed < 0 ? -1 : 1);
      }
    } else {
      nextStepAt = 0;
    }

    if (wheeling && now - wheelAt > 0.14) {
      wheeling = false;
      if (settings.snap && target !== null) target = Math.round(target);
    }

    const drift = settings.speed * brake;
    if (press && press.moved) {
      busy = true;
    } else if (target !== null) {
      [pos, vel] = springTo(pos, vel, target, dt, reduced ? 0.08 : wheeling ? 0.6 : 0.85, 0.82);
      if (Math.abs(pos - target) < 1e-4 && Math.abs(vel) < 1e-4) {
        pos = target;
        vel = 0;
        if (autoplay === "drift" && !stopped && !holding) target = null;
      } else {
        busy = true;
      }
      if (autoplay === "drift" && brakeTarget > 0 && target !== null && Math.abs(pos - target) < 0.02) {
        target = null;
      }
      if (target === null) momentum = vel - drift;
    } else {
      const inertia = clamp(settings.inertia, 0, 1);
      momentum *= Math.exp(-dt / (0.25 + 1.6 * inertia));
      if (Math.abs(momentum) < 1e-4) momentum = 0;
      else busy = true;
      vel = drift + momentum;
      pos += vel * dt;
    }

    const active = wrap(Math.round(pos));
    if (active !== reportedActive) {
      reportedActive = active;
      callbacks.onActive(active);
    }

    const pointerRad = (clamp(settings.pointerTilt, 0, 25) * Math.PI) / 180;
    if (reduced || pointerRad <= 0) {
      orbitX = orbitTargetX = 0;
      orbitY = orbitTargetY = 0;
    } else {
      const ease = 1 - Math.exp(-dt / 0.35);
      orbitX += (orbitTargetX * pointerRad - orbitX) * ease;
      orbitY += (orbitTargetY * pointerRad - orbitY) * ease;
      if (
        Math.abs(orbitTargetX * pointerRad - orbitX) > 1e-4 ||
        Math.abs(orbitTargetY * pointerRad - orbitY) > 1e-4
      ) {
        busy = true;
      } else {
        orbitX = orbitTargetX * pointerRad;
        orbitY = orbitTargetY * pointerRad;
      }
    }

    readSize();
    measure();

    const shown = pos + introFrom * (1 - introEase);
    const dim = clamp(settings.dim, 0, 1);
    const reflect = clamp(settings.reflection, 0, 1);
    const centre = Math.round(shown);
    let used = 0;
    for (let offset = -Math.floor(SLOTS / 2); offset < Math.ceil(SLOTS / 2) && used < SLOTS; offset++) {
      const index = centre + offset;
      const s = (index - shown) * geo.pitch;
      if (geo.k > 1e-5 && Math.abs(s * geo.k) > Math.PI * 0.98) continue;
      if (!facing(s)) continue;
      const left = screenX(s - geo.width / 2);
      const right = screenX(s + geo.width / 2);
      const middle = screenX(s);
      if (Number.isNaN(middle)) continue;
      if (Number.isNaN(left) || Number.isNaN(right)) continue;
      if (Math.max(left, right) < -1.15 || Math.min(left, right) > 1.15) continue;
      const panel = panels[used++];
      const picture = pictures[wrap(index)];
      const reveal = !started ? 0 : reduced ? 1 : clamp((introEase * 1.6 - Math.abs(offset) * 0.12) / 0.6, 0, 1);
      let hover = hoverMix.get(index) ?? 0;
      const hoverTarget = hovered === index ? 1 : 0;
      hover += (hoverTarget - hover) * (1 - Math.exp(-dt / 0.18));
      if (Math.abs(hover - hoverTarget) > 1e-3) busy = true;
      else hover = hoverTarget;
      hoverMix.set(index, hover);
      for (const mesh of [panel.mesh, panel.mirror]) {
        const isMirror = mesh === panel.mirror;
        mesh.visible = !isMirror || reflect > 0.001;
        const u = mesh.material.uniforms;
        u.uCenter.value = s;
        u.uWidth.value = geo.width;
        u.uK.value = geo.k;
        u.uRadius.value = geo.radius;
        u.uAlpha.value = reveal;
        u.uReflect.value = reflect;
        u.uDim.value = dim;
        u.uHover.value = hover;
        u.uGray.value = clamp(settings.grayscale, 0, 1);
        if (picture) {
          u.uImage.value = picture.uploaded ? picture.texture : blank;
          u.uImageAspect.value = picture.aspect;
          u.uLoaded.value = picture.uploaded ? picture.fade : 0;
        }
      }
    }
    for (let i = used; i < SLOTS; i++) {
      panels[i].mesh.visible = false;
      panels[i].mirror.visible = false;
    }
    for (const key of Array.from(hoverMix.keys())) {
      if (Math.abs(key - pos) > SLOTS) hoverMix.delete(key);
    }

    const items = itemsRef.current;
    const anchor = Math.round(shown);
    for (let offset = -2; offset <= 2; offset++) {
      const index = anchor + offset;
      const label = labels[((index % LABELS) + LABELS) % LABELS];
      const s = (index - shown) * geo.pitch;
      let opacity = 0;
      if (settings.captions && facing(s)) {
        if (label.index !== index) {
          label.index = index;
          const item = items[wrap(index)];
          label.title.textContent = item ? item.title ?? item.alt : "";
          label.subtitle.textContent = item?.subtitle ?? "";
          label.subtitle.style.display = item?.subtitle ? "" : "none";
        }
        const d = Math.abs(index - shown);
        const t = clamp((d - 0.45) / 0.4, 0, 1);
        const reveal = !started ? 0 : reduced ? 1 : clamp((introEase - 0.55) / 0.4, 0, 1);
        opacity = (1 - t * t * (3 - 2 * t)) * reveal;
        wallPoint(s, -0.5, scratch).project(camera);
        const x = ((scratch.x + 1) / 2) * width;
        const y = ((1 - scratch.y) / 2) * height + geo.labelGap;
        if (Number.isNaN(label.x) || Math.abs(x - label.x) > 0.05 || Math.abs(y - label.y) > 0.05) {
          label.x = x;
          label.y = y;
          label.node.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) translateX(-50%)`;
        }
      }
      if (Math.abs(opacity - label.opacity) > 0.002) {
        label.opacity = opacity;
        label.node.style.opacity = opacity.toFixed(3);
      }
    }

    wallPoint(0, -0.5, scratch).project(camera);
    const controlsTop = ((1 - scratch.y) / 2) * height + geo.controlsTop;
    if (Number.isNaN(reportedTop) || Math.abs(controlsTop - reportedTop) > 0.5) {
      reportedTop = controlsTop;
      callbacks.onLayout(controlsTop);
    }

    const wall = settingsRef.current.wallText;
    if (wall && wall.texts.length) {
      layoutText();
      const fading = paintText(now);
      const reveal = started ? (reduced ? 1 : clamp((introEase - 0.4) / 0.4, 0, 1)) : 0;
      // Shrink the whole band when the viewport is too narrow for it.
      let textH = wall.size ?? 0.16;
      wallPoint(textWidth / 2, wall.y ?? 0.66, textScratch).project(camera);
      const halfPx = Math.abs(((textScratch.x + 1) / 2) * width - width / 2);
      if (halfPx > 0.01) textH *= Math.min(1, (width * 0.46) / halfPx);
      const u = textMaterial.uniforms;
      u.uK.value = geo.k;
      u.uCenter.value = 0;
      u.uWidth.value = (textH * textCanvas.width) / textCanvas.height;
      u.uHeight.value = textH;
      // Sit the ink one card gap above the pictures.
      u.uY.value = wall.y ?? 0.5 + Math.max(0, settingsRef.current.gap) / geo.unit + textH * textPad;
      u.uColor.value.set(wall.color ?? "#ebebeb").convertLinearToSRGB();
      u.uAlpha.value = reveal;
      textMesh.visible = reveal > 0.001;
      if (fading > 0) busy = true;
    } else {
      textMesh.visible = false;
    }

    const action = settingsRef.current.wallAction;
    if (action && actCtx) {
      paintAction();
      const reveal = started ? (reduced ? 1 : clamp((introEase - 0.4) / 0.4, 0, 1)) : 0;
      const actH = action.size ?? 0.16;
      const u = actMaterial.uniforms;
      u.uK.value = geo.k;
      u.uWidth.value = actWidth;
      u.uHeight.value = actH;
      // One card gap below the pictures.
      u.uY.value = -0.5 - Math.max(0, settingsRef.current.gap) / geo.unit - actH / 2;
      u.uAlpha.value = reveal;
      actMesh.visible = reveal > 0.001;
      if (reveal > 0.001) {
        const half = actWidth / 2;
        const halfY = actH / 2;
        const project = (centre: number) => {
          const xs: number[] = [];
          const ys: number[] = [];
          for (const [s, y] of [
            [centre - half, u.uY.value + halfY],
            [centre + half, u.uY.value + halfY],
            [centre + half, u.uY.value - halfY],
            [centre - half, u.uY.value - halfY],
          ]) {
            wallPoint(s, y, scratch).project(camera);
            xs.push(((scratch.x + 1) / 2) * width);
            ys.push(((1 - scratch.y) / 2) * height);
          }
          return { xs, ys };
        };
        // Slide the pill along the arc until it fits the viewport.
        let centre = action.x ?? geo.width / 2 - half;
        let xs: number[] = [];
        let ys: number[] = [];
        for (let pass = 0; pass < 3; pass++) {
          ({ xs, ys } = project(centre));
          const pxPerS = (xs[1] - xs[0]) / actWidth;
          if (!(Math.abs(pxPerS) > 1e-6)) break;
          const rightSpill = Math.max(...xs) - (width - 14);
          const leftSpill = 14 - Math.min(...xs);
          if (rightSpill <= 0 && leftSpill <= 0) break;
          centre += (leftSpill > 0 ? leftSpill : -rightSpill) / pxPerS;
        }
        u.uCenter.value = centre;
        const left = Math.min(...xs);
        const top = Math.min(...ys);
        const boxW = Math.max(Math.max(...xs) - left, 1);
        const boxH = Math.max(Math.max(...ys) - top, 1);
        const shape = xs
          .map((x, i) => `${(((x - left) / boxW) * 100).toFixed(2)}% ${(((ys[i] - top) / boxH) * 100).toFixed(2)}%`)
          .join(", ");
        actLink.style.left = `${left.toFixed(1)}px`;
        actLink.style.top = `${top.toFixed(1)}px`;
        actLink.style.width = `${boxW.toFixed(1)}px`;
        actLink.style.height = `${boxH.toFixed(1)}px`;
        actLink.style.clipPath = `polygon(${shape})`;
        actLink.style.opacity = "1";
        actLink.style.pointerEvents = "auto";
      } else {
        actLink.style.opacity = "0";
        actLink.style.pointerEvents = "none";
      }
    } else {
      actMesh.visible = false;
      actLink.style.opacity = "0";
      actLink.style.pointerEvents = "none";
    }

    renderer.render(scene, camera);

    if (busy || press || (autoplay === "drift" && brake > 0.001)) {
      schedule();
    } else if (autoplay === "step" && !stopped && !touching && count() > 1) {
      timer = window.setTimeout(() => {
        timer = 0;
        last = 0;
        schedule();
      }, Math.max(Math.max(nextStepAt, holdUntil) - now, 0.02) * 1000 + 16);
    } else if (autoplay === "drift" && !stopped && !touching && now < holdUntil) {
      timer = window.setTimeout(() => {
        timer = 0;
        last = 0;
        schedule();
      }, (holdUntil - now) * 1000 + 16);
    } else if (wall && wall.texts.length && !stopped) {
      const wait = Math.max(textSince + Math.max(wall.interval ?? 2.6, 0.8) - now, 0.02);
      timer = window.setTimeout(() => {
        timer = 0;
        last = 0;
        schedule();
      }, wait * 1000 + 16);
    }
  }

  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== "touch") {
      pointerInside = true;
      if (!press) {
        const next = panelAt(event.clientX, event.clientY);
        if (next !== hovered) hovered = next;
        root.style.cursor =
          next !== null ? "pointer" : settingsRef.current.draggable ? "grab" : "";
      }
    }
    if (press && press.id === event.pointerId) {
      if (!press.moved && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 6) {
        press.moved = true;
        hovered = null;
        target = null;
        vel = 0;
        momentum = 0;
        root.style.cursor = "grabbing";
        try {
          stage.setPointerCapture(event.pointerId);
        } catch {}
      }
      if (press.moved) {
        const hit = hitAt(event.clientX, event.clientY);
        if (hit) {
          pos = press.origin + (press.grab - hit.s) / geo.pitch;
          const t = performance.now();
          press.samples.push({ t, p: pos });
          while (press.samples.length > 2 && t - press.samples[0].t > 110) press.samples.shift();
        }
      }
    }
    schedule();
  };

  const onDown = (event: PointerEvent) => {
    if (!event.isPrimary || event.button > 0) return;
    if (!settingsRef.current.draggable) {
      press = null;
      consumed = false;
      return;
    }
    const hit = hitAt(event.clientX, event.clientY);
    press = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      grab: hit ? hit.s : 0,
      origin: pos,
      moved: false,
      samples: [{ t: performance.now(), p: pos }],
    };
    consumed = false;
    hold();
    schedule();
  };

  const finish = (event: PointerEvent) => {
    if (!press || press.id !== event.pointerId) return;
    const ended = press;
    press = null;
    try {
      if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    } catch {}
    if (ended.moved) {
      consumed = true;
      const t = performance.now();
      const recent = ended.samples.filter((sample) => t - sample.t < 110);
      let velocity = 0;
      if (recent.length > 1 && t - recent[recent.length - 1].t < 60) {
        const span = Math.max((recent[recent.length - 1].t - recent[0].t) / 1000, 1 / 120);
        velocity = (recent[recent.length - 1].p - recent[0].p) / span;
      }
      const settings = settingsRef.current;
      velocity = settings.reduced ? 0 : clamp(velocity, -14, 14);
      vel = velocity;
      momentum = velocity;
      const inertia = clamp(settings.inertia, 0, 1);
      if (settings.snap) {
        target = Math.round(pos + velocity * (0.14 + 0.46 * inertia));
      } else {
        target = null;
      }
      hold();
      root.style.cursor = settings.draggable ? "grab" : "";
    }
    schedule();
  };

  const onClick = (event: MouseEvent) => {
    if (consumed) {
      consumed = false;
      return;
    }
    const index = panelAt(event.clientX, event.clientY);
    if (index === null) return;
    // klik tidak lagi memusatkan panel; hanya select saat panel sudah di tengah
    if (index === Math.round(target ?? pos) && Math.abs(pos - Math.round(pos)) < 0.2) {
      callbacks.onSelect(wrap(index));
    }
  };

  const onLeave = (event: PointerEvent) => {
    if (press && press.id === event.pointerId) return;
    pointerInside = false;
    hovered = null;
    root.style.cursor = "";
    hold(0.6);
    schedule();
  };

  const onWheel = (event: WheelEvent) => {
    if (!settingsRef.current.wheel) return;
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? height : 1;
    const delta = clamp((Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) * unit, -240, 240);
    const base = target ?? (settingsRef.current.snap ? Math.round(pos) : pos);
    target = (wheeling ? base : settingsRef.current.snap ? Math.round(base) : base) + delta / 100;
    wheeling = true;
    wheelAt = clock();
    hold();
    schedule();
  };

  const onKey = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(count() - 1);
    } else if (event.key === "Enter" && event.target === root) {
      event.preventDefault();
      callbacks.onSelect(wrap(Math.round(target ?? pos)));
    }
  };

  stage.addEventListener("pointerdown", onDown);
  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerup", finish);
  stage.addEventListener("pointercancel", finish);
  stage.addEventListener("pointerleave", onLeave);
  stage.addEventListener("click", onClick);
  stage.addEventListener("wheel", onWheel, { passive: false });
  root.addEventListener("keydown", onKey);

  const orbitView = doc.defaultView ?? window;
  const onOrbit = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    // Wall turns to face the pointer: camera on the pointer's side (x) and
    // below it (y) so the drum leans toward the cursor like the portrait does.
    orbitTargetX = 1 - (event.clientY / Math.max(orbitView.innerHeight, 1)) * 2;
    orbitTargetY = (event.clientX / Math.max(orbitView.innerWidth, 1)) * 2 - 1;
    schedule();
  };
  orbitView.addEventListener("pointermove", onOrbit);

  const resizer = new ResizeObserver(() => {
    if (readSize()) {
      measure();
      schedule();
    }
  });
  resizer.observe(root);

  const observer =
    typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(
          ([entry]) => {
            visible = entry.isIntersecting;
            if (visible) {
              last = 0;
              schedule();
            } else {
              if (raf) cancelAnimationFrame(raf);
              raf = 0;
              if (timer) window.clearTimeout(timer);
              timer = 0;
            }
          },
          { rootMargin: "80px" },
        );
  if (observer) observer.observe(root);
  else visible = true;

  const onLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };
  const onRestored = () => {
    lost = false;
    itemsKey = "";
    loadPictures();
    schedule();
  };
  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", onRestored);

  const syncPlaceholder = () => {
    const value = settingsRef.current.backgroundColor;
    if (parseColor(value)) {
      placeholder.set(isLight(value) ? 0x000000 : 0xffffff);
      return;
    }
    const ink = toRgb(window.getComputedStyle(root).color);
    if (ink) placeholder.setStyle(ink, THREE.NoColorSpace);
  };

  readSize();
  if (sized) measure();
  syncPlaceholder();
  loadPictures();
  schedule();

  return {
    sync: () => {
      if (readSize() || sized) measure();
      syncPlaceholder();
      loadPictures();
      schedule();
    },
    step,
    goTo,
    destroy: () => {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      if (timer) window.clearTimeout(timer);
      observer?.disconnect();
      resizer.disconnect();
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", finish);
      stage.removeEventListener("pointercancel", finish);
      stage.removeEventListener("pointerleave", onLeave);
      stage.removeEventListener("click", onClick);
      stage.removeEventListener("wheel", onWheel);
      root.removeEventListener("keydown", onKey);
      orbitView.removeEventListener("pointermove", onOrbit);
      root.style.cursor = "";
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      pictures.forEach((picture) => {
        picture.image.onload = null;
        picture.texture.dispose();
      });
      panels.forEach((panel) => {
        panel.mesh.material.dispose();
        panel.mirror.material.dispose();
      });
      hoverMix.clear();
      labels.forEach((label) => label.node.remove());
      blank.dispose();
      textTexture.dispose();
      textMaterial.dispose();
      actTexture.dispose();
      actMaterial.dispose();
      actLink.remove();
      geometry.dispose();
      renderer.dispose();
      if (!renderer.getContext().isContextLost()) renderer.forceContextLoss();
      canvas.remove();
    },
  };
};

export const ConcaveCarousel = forwardRef<ConcaveCarouselHandle, ConcaveCarouselProps>(
  function ConcaveCarousel(
    {
      items = defaultItems,
      startIndex = 0,
      aspect = 1.25,
      size = 0.46,
      curvature = 0.72,
      distance = 4,
      tilt = 0,
      pointerTilt = 0,
      gap = 16,
      radius = 14,
      reflection = 0.06,
      grayscale = 0,
      dim = 0.35,
      autoplay = "drift",
      speed = 0.16,
      interval = 4,
      snap = true,
      inertia = 0.5,
      pauseOnHover = true,
      draggable = true,
      wheel = true,
      captions = true,
      controls = true,
      backgroundColor = "transparent",
      paused = false,
      wallText,
      wallAction,
      dpr = 2,
      ariaLabel = "Concave carousel. Drag, scroll or use the arrow keys to turn the wall. Space pauses the motion.",
      onIndexChange,
      onSelect,
      className,
      style,
    },
    ref,
  ) {
    const rootRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const labelRef = useRef<HTMLDivElement>(null);
    const controllerRef = useRef<Controller | null>(null);
    const reduced = useSyncExternalStore(subscribeToMotion, readMotion, () => false);
    const list = items.length ? items : defaultItems;
    const itemsRef = useRef(list);
    const [initialIndex] = useState(() =>
      clamp(Math.round(startIndex), 0, Math.max(list.length - 1, 0)),
    );
    const [active, setActive] = useState(initialIndex);
    const [held, setHeld] = useState(false);
    const [failed, setFailed] = useState(false);
    const [controlsTop, setControlsTop] = useState<number | null>(null);

    const settings: Settings = {
      aspect,
      size,
      curvature,
      distance,
      tilt,
      pointerTilt,
      gap,
      radius,
      reflection,
      grayscale,
      dim,
      autoplay,
      speed,
      interval,
      snap,
      inertia,
      pauseOnHover,
      draggable,
      wheel,
      captions,
      controls,
      backgroundColor,
      paused,
      dpr,
      wallText,
      wallAction,
      reduced,
      held,
    };
    const settingsRef = useRef(settings);
    const callbacksRef = useRef({ onIndexChange, onSelect });

    useEffect(() => {
      settingsRef.current = settings;
      itemsRef.current = list;
      callbacksRef.current = { onIndexChange, onSelect };
      controllerRef.current?.sync();
    });

    useEffect(() => {
      const root = rootRef.current;
      const stage = stageRef.current;
      const labelHost = labelRef.current;
      if (!root || !stage || !labelHost) return;
      const controller = createRotunda(root, stage, labelHost, settingsRef, itemsRef, initialIndex, {
        onActive: (index) => {
          setActive(index);
          callbacksRef.current.onIndexChange?.(index);
        },
        onSelect: (index) => {
          const item = itemsRef.current[index];
          if (!item) return;
          callbacksRef.current.onSelect?.(item, index);
          if (item.href) window.location.assign(item.href);
        },
        onLayout: (top) => setControlsTop(top),
      });
      if (!controller) {
        const frame = requestAnimationFrame(() => setFailed(true));
        return () => cancelAnimationFrame(frame);
      }
      controllerRef.current = controller;
      return () => {
        controller.destroy();
        controllerRef.current = null;
      };
    }, [initialIndex]);

    useImperativeHandle(
      ref,
      () => ({
        next: () => controllerRef.current?.step(1),
        previous: () => controllerRef.current?.step(-1),
        goTo: (index: number) => controllerRef.current?.goTo(index),
      }),
      [],
    );

    const background = backgroundColor.trim().toLowerCase();
    const transparent = background === "transparent" || background === "";
    const light = !transparent && isLight(background);
    const ink = transparent ? "currentColor" : light ? "#0a0a0a" : "#fafafa";
    const current = list[active] ?? list[0];

    return (
      <div
        ref={rootRef}
        className={cn(
          "relative h-full min-h-[420px] w-full overflow-hidden outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[color-mix(in_oklch,currentColor_35%,transparent)]",
          className,
        )}
        style={{ backgroundColor: transparent ? undefined : backgroundColor, color: ink, ...style }}
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === " " && event.target === event.currentTarget) {
            event.preventDefault();
            setHeld((value) => !value);
          }
        }}
      >
        <div ref={stageRef} style={stageStyle} />
        <div ref={labelRef} style={labelLayerStyle} />
        {failed && current ? (
          <div style={{ position: "absolute", inset: "14%", display: "grid", placeItems: "center" }}>
            <img
              src={current.src}
              alt={current.alt}
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "cover", borderRadius: radius }}
            />
          </div>
        ) : null}
        <ul style={hiddenStyle}>
          {list.map((item, index) => (
            <li key={`${item.src}-${index}`} aria-current={index === active ? "true" : undefined}>
              {item.title ? `${item.title}: ${item.alt}` : item.alt}
            </li>
          ))}
        </ul>
        <div aria-live="polite" style={hiddenStyle}>
          {current ? current.title ?? current.alt : ""}
        </div>
        {controls ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: controlsTop ?? "82%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 18,
              pointerEvents: "none",
              fontSize: 12,
              fontVariantNumeric: "tabular-nums",
              opacity: controlsTop === null ? 0 : 1,
              transition: "opacity 400ms ease",
            }}
          >
            <button
              type="button"
              aria-label="Previous"
              onClick={() => controllerRef.current?.step(-1)}
              onPointerEnter={(event) => {
                event.currentTarget.style.background = raisedHover;
              }}
              onPointerLeave={(event) => {
                event.currentTarget.style.background = raised;
              }}
              style={controlStyle}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <span style={{ minWidth: 56, textAlign: "center", letterSpacing: "0.02em" }}>
              <span style={{ opacity: 0.85 }}>{String(active + 1).padStart(2, "0")}</span>
              <span style={{ opacity: 0.4 }}> / {String(list.length).padStart(2, "0")}</span>
            </span>
            <button
              type="button"
              aria-label="Next"
              onClick={() => controllerRef.current?.step(1)}
              onPointerEnter={(event) => {
                event.currentTarget.style.background = raisedHover;
              }}
              onPointerLeave={(event) => {
                event.currentTarget.style.background = raised;
              }}
              style={controlStyle}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        ) : null}
      </div>
    );
  },
);

ConcaveCarousel.displayName = "ConcaveCarousel";

export default ConcaveCarousel;
