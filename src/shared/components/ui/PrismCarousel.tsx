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

export interface PrismCarouselItem {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
  href?: string;
}

export interface PrismCarouselProps {
  items?: PrismCarouselItem[];
  startIndex?: number;
  aspect?: number;
  size?: number;
  neighborScale?: number;
  gap?: number;
  radius?: number;
  saturation?: number;
  dim?: number;
  sweep?: number;
  sweepDuration?: number;
  dispersion?: number;
  autoplay?: boolean;
  interval?: number;
  loop?: boolean;
  captions?: boolean;
  controls?: boolean;
  draggable?: boolean;
  wheel?: boolean;
  pauseOnHover?: boolean;
  backgroundColor?: string;
  paused?: boolean;
  dpr?: number;
  ariaLabel?: string;
  onIndexChange?: (index: number) => void;
  onSelect?: (item: PrismCarouselItem, index: number) => void;
  className?: string;
  style?: CSSProperties;
}

export interface PrismCarouselHandle {
  next: () => void;
  previous: () => void;
  goTo: (index: number) => void;
}

type Settings = Required<
  Omit<
    PrismCarouselProps,
    "className" | "style" | "onIndexChange" | "onSelect" | "ariaLabel" | "startIndex"
  >
> & {
  reduced: boolean;
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
}

interface Slot {
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
  visible: boolean;
}

interface Picture {
  image: HTMLImageElement;
  texture: THREE.Texture;
  aspect: number;
  ready: boolean;
  fade: number;
}

const SLOTS = 11;
const TAU = Math.PI * 2;
const REACH = 10;
const SOFT = 0.35;

const defaultItems: PrismCarouselItem[] = [
  {
    src: "https://pro.reactbits.dev/demo-media/abstract-rose-balance.webp",
    alt: "Tilted raspberry rounded rectangle and tangerine disc on a rose-pink field",
    title: "Rose balance",
    subtitle: "A bright point of balance",
  },
  {
    src: "https://pro.reactbits.dev/demo-media/abstract-pink-eclipse.webp",
    alt: "Coral-pink disc crossing a violet diagonal plane on a grainy purple field",
    title: "Pink eclipse",
    subtitle: "A disc across the diagonal",
  },
  {
    src: "https://pro.reactbits.dev/demo-media/abstract-amber-loop.webp",
    alt: "Tilted golden-amber loop on a grainy raspberry-purple field",
    title: "Amber loop",
    subtitle: "Warmth around an open center",
  },
  {
    src: "https://pro.reactbits.dev/demo-media/abstract-coral-fold.webp",
    alt: "Broad vermilion and orange folded plane over deep plum with fine grain",
    title: "Coral fold",
    subtitle: "A bold change of direction",
  },
  {
    src: "https://pro.reactbits.dev/demo-media/abstract-fuchsia-wave.webp",
    alt: "Broad fuchsia S-shaped band with a coral gradient across deep plum",
    title: "Fuchsia wave",
    subtitle: "One continuous curve",
  },
  {
    src: "https://pro.reactbits.dev/demo-media/abstract-orchid-orbit.webp",
    alt: "Fuchsia ring and peach crescent on a grainy orchid-purple field",
    title: "Orchid orbit",
    subtitle: "Color in orbit",
  },
  {
    src: "https://pro.reactbits.dev/demo-media/abstract-plum-ribbon.webp",
    alt: "Intersecting pink and plum diagonal ribbons on a coral-magenta field",
    title: "Plum ribbon",
    subtitle: "Two ribbons, one crossing",
  },
  {
    src: "https://pro.reactbits.dev/demo-media/abstract-violet-steps.webp",
    alt: "Three interlocking violet and pink stepped planes with an amber edge",
    title: "Violet steps",
    subtitle: "Three planes in rhythm",
  },
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const smooth = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};

const rampArea = (u: number) => {
  if (u >= 1) return 0.5;
  if (u <= -1) return -0.5;
  return u - (u * Math.abs(u)) / 2;
};

const softHat = (x: number) => (rampArea(x + SOFT) - rampArea(x - SOFT)) / (2 * SOFT);

const subscribeToMotion = (notify: () => void) => {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};

const readMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isLight = (value: string) => {
  const hex = value.replace("#", "");
  if (!/^[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(hex)) return false;
  const full = hex.length === 3 ? hex.replace(/./g, (c) => c + c) : hex;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.6;
};

const springTo = (
  value: number,
  velocity: number,
  target: number,
  dt: number,
  response: number,
  ratio = 1,
) => {
  const omega = TAU / Math.max(response, 0.02);
  const substeps = Math.max(1, Math.ceil(dt / (1 / 120)));
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
  transition: "background-color 160ms ease",
};

const vertexShader = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform sampler2D uImage;
uniform float uImageAspect;
uniform vec2 uSize;
uniform float uRadius;
uniform float uLoaded;
uniform float uBase;
uniform float uReveal;
uniform float uDirection;
uniform float uBand;
uniform float uSweep;
uniform float uSpreadPx;
uniform float uBright;
uniform float uAlpha;
varying vec2 vUv;

float roundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

vec3 spectrum(float t) {
  return clamp(0.5 + 0.5 * cos(6.2831853 * (t + vec3(0.0, 0.33, 0.67))), 0.0, 1.0);
}

vec3 sampleImage(vec2 uv) {
  float spread = uSpreadPx / max(uSize.x, uSize.y * uImageAspect);
  if (abs(spread) < 0.0004) return texture2D(uImage, uv).rgb;
  float jitter = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  vec3 total = vec3(0.0);
  vec3 weights = vec3(0.0);
  for (int k = 0; k < 9; k++) {
    float t = (float(k) + jitter) / 9.0;
    vec3 w = spectrum(t * 0.82);
    total += texture2D(uImage, uv + vec2((t - 0.5) * spread, 0.0)).rgb * w;
    weights += w;
  }
  return total / weights;
}

void main() {
  vec2 p = (vUv - 0.5) * uSize;
  float d = roundBox(p, uSize * 0.5, min(uRadius, min(uSize.x, uSize.y) * 0.5));
  float aa = max(fwidth(d), 1e-3) * 0.75;
  float mask = 1.0 - smoothstep(-aa, aa, d);
  if (mask * uAlpha < 0.002) discard;

  float cardAspect = uSize.x / max(uSize.y, 1.0);
  vec2 uv = vUv - 0.5;
  if (cardAspect > uImageAspect) {
    uv.y *= uImageAspect / cardAspect;
  } else {
    uv.x *= cardAspect / uImageAspect;
  }
  uv += 0.5;

  vec3 full = sampleImage(uv);
  float luma = dot(full, vec3(0.2126, 0.7152, 0.0722));
  vec3 gray = vec3(luma);

  float along = uDirection > 0.0 ? vUv.x : 1.0 - vUv.x;
  float front = uReveal;
  float behind = uReveal < -0.5 ? 0.0 : 1.0 - smoothstep(front - uBand, front, along);
  float amount = max(uBase, behind);
  vec3 color = mix(gray, full, amount);
  if (uReveal > -0.5) {
    float mid = front - uBand * 0.5;
    float bandShape = exp(-pow((along - mid) / (uBand * 0.42), 2.0));
    vec3 light = spectrum(clamp((along - front + uBand) / uBand, 0.0, 1.0) * 0.82);
    color += light * bandShape * uSweep * 0.28 * (1.0 - uBase);
  }
  color *= uBright;

  vec3 placeholder = vec3(0.5);
  float loaded = clamp(uLoaded, 0.0, 1.0);
  vec3 rgb = mix(placeholder, color, loaded);
  float alpha = mask * uAlpha * mix(0.12, 1.0, loaded);
  gl_FragColor = vec4(rgb * alpha, alpha);
}
`;

const createPrism = (
  root: HTMLElement,
  stage: HTMLElement,
  settingsRef: { current: Settings },
  itemsRef: { current: PrismCarouselItem[] },
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
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });
  } catch {
    return null;
  }
  stage.appendChild(canvas);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
  const plane = new THREE.PlaneGeometry(1, 1);
  const blank = new THREE.DataTexture(new Uint8Array([128, 128, 128, 255]), 1, 1);
  blank.needsUpdate = true;

  const slots: Slot[] = Array.from({ length: SLOTS }, () => {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uImage: { value: blank as THREE.Texture },
        uImageAspect: { value: 1.5 },
        uSize: { value: new THREE.Vector2(1, 1) },
        uRadius: { value: 16 },
        uLoaded: { value: 0 },
        uBase: { value: 0 },
        uReveal: { value: -1 },
        uDirection: { value: 1 },
        uBand: { value: 0.24 },
        uSweep: { value: 1 },
        uSpreadPx: { value: 0 },
        uBright: { value: 1 },
        uAlpha: { value: 1 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      premultipliedAlpha: true,
      depthTest: false,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(plane, material);
    mesh.frustumCulled = false;
    mesh.visible = false;
    scene.add(mesh);
    return { mesh, index: 0, x: 0, y: 0, w: 0, h: 0, visible: false };
  });

  let pictures: Picture[] = [];
  let itemsKey = "";
  let width = 1;
  let height = 1;
  let dpr = 1;
  let pos = startIndex;
  let posV = 0;
  let target = startIndex;
  let dragging = false;
  let settle = false;
  let wheelAt = 0;
  let active = Math.round(startIndex);
  let reportedActive = Number.NaN;
  let sweepIndex = active;
  let sweepStart = -10;
  let sweepDirection = 1;
  let hovered: number | null = null;
  let pointerInside = false;
  let time = 0;
  let autoClock = 0;
  let raf = 0;
  let timer = 0;
  let last = 0;
  let visible = false;
  let destroyed = false;
  let lost = false;
  let consumed = false;
  const colors = new Map<number, { value: number; velocity: number }>();
  const knotX = new Float64Array(REACH + 2);
  const knotW = new Float64Array(REACH + 2);
  let stride = 1;
  let activeHeight = 1;
  let neighborHeight = 1;
  let profileKey = "";
  let lastMoveAt = 0;
  let press: {
    id: number;
    x: number;
    lastX: number;
    moved: boolean;
    samples: { t: number; d: number }[];
  } | null = null;

  const count = () => Math.max(itemsRef.current.length, 1);
  const wrap = (index: number) => ((index % count()) + count()) % count();

  const loadPictures = () => {
    const items = itemsRef.current;
    const key = items.map((item) => item.src).join("\u0000");
    if (key === itemsKey) return;
    itemsKey = key;
    pictures.forEach((picture) => {
      picture.image.onload = null;
      picture.texture.dispose();
    });
    pictures = items.map((item) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.decoding = "async";
      const texture = new THREE.Texture(image);
      texture.colorSpace = THREE.NoColorSpace;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      const picture: Picture = { image, texture, aspect: 1.5, ready: false, fade: 0 };
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

  const resize = () => {
    const settings = settingsRef.current;
    const rect = root.getBoundingClientRect();
    const nextDpr = Math.min(window.devicePixelRatio || 1, Math.max(settings.dpr, 0.5));
    const nextWidth = Math.max(1, Math.round(rect.width));
    const nextHeight = Math.max(1, Math.round(rect.height));
    if (nextWidth === width && nextHeight === height && nextDpr === dpr) return false;
    width = nextWidth;
    height = nextHeight;
    dpr = nextDpr;
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();
    return true;
  };

  const metrics = () => {
    const settings = settingsRef.current;
    const aspect = clamp(settings.aspect, 0.5, 3);
    const reserve = (settings.captions ? 46 : 0) + (settings.controls ? 46 : 0);
    const room = Math.max(height - reserve, height * 0.5);
    const share = 0.62 + 0.22 * smooth((900 - width) / 500);
    const activeH = Math.min(room * clamp(settings.size, 0.2, 0.98), (width * share) / aspect);
    const neighborH = activeH * clamp(settings.neighborScale, 0.3, 1);
    const widths = [activeH * aspect, neighborH * 0.72, neighborH * 0.24, neighborH * 0.08, 0];
    return { activeH, neighborH, widths, gap: Math.max(settings.gap, 0), lift: (height - room) / 2 };
  };

  const buildProfile = () => {
    const { activeH, neighborH, widths, gap } = metrics();
    activeHeight = activeH;
    neighborHeight = neighborH;
    const key = `${activeH}|${neighborH}|${widths.join(",")}|${gap}`;
    if (key === profileKey) return;
    profileKey = key;
    const centre = 1 - SOFT / 2;
    const side = SOFT / 4;
    for (let k = 0; k <= REACH + 1; k++) knotW[k] = widths[k] ?? 0;
    for (let pass = 0; pass < 60; pass++) {
      for (let k = 0; k <= REACH; k++) {
        const wanted = widths[k] ?? 0;
        const left = k === 0 ? knotW[1] : knotW[k - 1];
        knotW[k] = Math.max(0, (wanted - side * (left + knotW[k + 1])) / centre);
      }
    }
    knotW[REACH + 1] = 0;
    knotX[0] = 0;
    for (let k = 1; k <= REACH + 1; k++) {
      knotX[k] = knotX[k - 1] + (knotW[k - 1] + knotW[k]) / 2 + gap;
    }
    stride = knotX[1];
  };

  const sample = (knots: Float64Array, d: number, odd: boolean) => {
    let total = 0;
    const from = Math.ceil(d - 1 - SOFT);
    const to = Math.floor(d + 1 + SOFT);
    for (let k = from; k <= to; k++) {
      const weight = softHat(d - k);
      if (weight <= 0) continue;
      const a = Math.min(Math.abs(k), REACH + 1);
      const value = knots[a];
      total += weight * (odd && k < 0 ? -value : value);
    }
    return total;
  };

  const place = (d: number) => {
    const t = smooth(Math.abs(d));
    return {
      x: sample(knotX, d, true),
      w: Math.max(sample(knotW, d, false), 0),
      h: activeHeight + (neighborHeight - activeHeight) * t,
    };
  };

  const spacing = () => {
    buildProfile();
    return stride;
  };

  const clampTarget = (value: number) =>
    settingsRef.current.loop ? value : clamp(value, 0, count() - 1);

  const goTo = (index: number) => {
    const settings = settingsRef.current;
    if (settings.loop) {
      const n = count();
      const current = Math.round(target);
      const offset = ((((index - wrap(current)) % n) + n + Math.floor(n / 2)) % n) - Math.floor(n / 2);
      target = current + offset;
    } else {
      target = clamp(index, 0, count() - 1);
    }
    autoClock = 0;
    schedule();
  };

  const step = (direction: number) => {
    target = clampTarget(Math.round(target) + direction);
    autoClock = 0;
    schedule();
  };

  const schedule = () => {
    if (destroyed || lost || !visible || raf) return;
    if (timer) {
      window.clearTimeout(timer);
      timer = 0;
    }
    raf = requestAnimationFrame(frame);
  };

  const colorFor = (index: number) => {
    let entry = colors.get(index);
    if (!entry) {
      entry = { value: settingsRef.current.saturation, velocity: 0 };
      colors.set(index, entry);
    }
    return entry;
  };

  function frame(now: number) {
    raf = 0;
    if (destroyed || lost) return;
    const settings = settingsRef.current;
    const dt = last ? Math.min(Math.max((now - last) / 1000, 0), 0.05) : 1 / 60;
    last = now;
    time += dt;
    const reduced = settings.reduced;
    let busy = false;

    const holding = settings.pauseOnHover && pointerInside;
    if (settings.autoplay && !settings.paused && !reduced && !holding && !press && count() > 1) {
      autoClock += dt;
      if (autoClock >= Math.max(settings.interval, 1)) {
        autoClock = 0;
        if (!settings.loop && Math.round(target) >= count() - 1) target = 0;
        else target = clampTarget(Math.round(target) + 1);
      }
    }

    if (settle && !press && now - wheelAt > 140) {
      settle = false;
      target = clampTarget(Math.round(target));
    }

    if (!dragging) {
      [pos, posV] = springTo(pos, posV, target, dt, reduced ? 0.05 : 0.62, 0.92);
      if (Math.abs(pos - target) < 1e-4 && Math.abs(posV) < 1e-4) {
        pos = target;
        posV = 0;
      } else {
        busy = true;
      }
    } else {
      posV *= Math.exp(-dt * 6);
      busy = true;
    }

    const nextActive = Math.round(pos);
    if (nextActive !== active) {
      sweepDirection = nextActive > active ? 1 : -1;
      const outgoing = colorFor(active);
      const revealed = clamp((time - sweepStart) / Math.max(settings.sweepDuration, 0.1), 0, 1);
      outgoing.value = Math.max(outgoing.value, revealed);
      active = nextActive;
      sweepIndex = active;
      sweepStart = time;
    }
    const wrapped = wrap(active);
    if (wrapped !== reportedActive) {
      reportedActive = wrapped;
      callbacks.onActive(wrapped);
    }

    const { activeH, lift } = metrics();
    buildProfile();
    const c = Math.round(pos);

    const sweepSpan = Math.max(settings.sweepDuration, 0.1);
    const sweepProgress = reduced ? 2 : (time - sweepStart) / sweepSpan;
    const band = 0.26;
    if (sweepProgress < 1.4) busy = true;
    const speed = Math.abs(posV) * spacing();
    const spreadPx = reduced ? 0 : clamp(speed * 0.006 * Math.max(settings.dispersion, 0), 0, 22) * Math.sign(posV);

    for (let k = 0; k < SLOTS; k++) {
      const slot = slots[k];
      const index = c - 5 + k;
      const d = index - pos;
      const spot = place(d);
      const cardW = spot.w;
      const cardH = spot.h;
      const inRange = settings.loop || (index >= 0 && index < count());
      const alpha = smooth((3.6 - Math.abs(d)) / 0.8);
      slot.visible = inRange && cardW > 0.5 && alpha > 0.002 && pictures.length > 0;
      slot.mesh.visible = slot.visible;
      slot.index = index;
      if (!slot.visible) continue;
      const x = spot.x;
      slot.x = x;
      slot.y = lift;
      slot.w = cardW;
      slot.h = cardH;
      slot.mesh.position.set(x, lift, 0);
      slot.mesh.scale.set(cardW, cardH, 1);
      const picture = pictures[wrap(index)];
      const uniforms = slot.mesh.material.uniforms;
      if (picture) {
        uniforms.uImage.value = picture.texture;
        uniforms.uImageAspect.value = picture.aspect;
        if (picture.ready && picture.fade < 1) {
          picture.fade = reduced ? 1 : Math.min(1, picture.fade + dt / 0.45);
          busy = true;
        }
        uniforms.uLoaded.value = picture.ready ? picture.fade : 0;
      }
      uniforms.uSize.value.set(cardW, cardH);
      uniforms.uRadius.value = clamp(settings.radius, 0, 200) * (cardH / activeH);
      uniforms.uAlpha.value = alpha;
      uniforms.uBright.value = 1 - clamp(settings.dim, 0, 1) * smooth(Math.abs(d));
      uniforms.uSpreadPx.value = spreadPx * (1 - smooth((Math.abs(d) - 0.5) / 1.5));
      uniforms.uSweep.value = clamp(settings.sweep, 0, 3);
      uniforms.uBand.value = band;
      uniforms.uDirection.value = sweepDirection;

      const entry = colorFor(index);
      const peek = hovered === index && index !== active ? 0.6 : 0;
      const base = clamp(settings.saturation, 0, 1);
      if (index === sweepIndex && index === active) {
        uniforms.uBase.value = Math.max(Math.min(entry.value, 1), base);
        if (sweepProgress >= 1 + band || settings.sweep <= 0) {
          entry.value = 1;
          entry.velocity = 0;
          uniforms.uReveal.value = -1;
          uniforms.uBase.value = 1;
        } else {
          uniforms.uReveal.value = sweepProgress * (1 + band);
        }
      } else {
        [entry.value, entry.velocity] = springTo(
          entry.value,
          entry.velocity,
          Math.max(base, peek),
          dt,
          reduced ? 0.05 : peek > 0 ? 0.45 : 0.7,
        );
        if (Math.abs(entry.value - Math.max(base, peek)) > 1e-3) busy = true;
        uniforms.uBase.value = clamp(entry.value, 0, 1);
        uniforms.uReveal.value = -1;
      }
    }

    for (const key of Array.from(colors.keys())) {
      if (Math.abs(key - pos) > 8) colors.delete(key);
    }

    root.style.setProperty("--prism-caption-y", `${height / 2 - lift + activeH / 2 + 16}px`);
    renderer.render(scene, camera);

    if (busy || dragging || press || pointerInside) {
      schedule();
    } else if (settings.autoplay && !settings.paused && !reduced && count() > 1) {
      const remaining = Math.max(settings.interval - autoClock, 0);
      timer = window.setTimeout(() => {
        timer = 0;
        last = 0;
        autoClock = settings.interval;
        schedule();
      }, remaining * 1000);
    }
  }

  const pickAt = (clientX: number, clientY: number) => {
    const rect = root.getBoundingClientRect();
    const x = clientX - rect.left - width / 2;
    const y = -(clientY - rect.top - height / 2);
    let best: number | null = null;
    let bestDistance = Infinity;
    for (const slot of slots) {
      if (!slot.visible || slot.w < 6) continue;
      if (Math.abs(x - slot.x) <= slot.w / 2 && Math.abs(y - slot.y) <= slot.h / 2) {
        const distance = Math.abs(slot.index - pos);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = slot.index;
        }
      }
    }
    return best;
  };

  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== "touch") {
      pointerInside = true;
      const next = pickAt(event.clientX, event.clientY);
      if (next !== hovered) {
        hovered = next;
        root.style.cursor = next !== null ? "pointer" : settingsRef.current.draggable ? "grab" : "";
      }
    }
    if (press && press.id === event.pointerId) {
      const dx = event.clientX - press.lastX;
      if (!press.moved && Math.abs(event.clientX - press.x) > 6) {
        press.moved = true;
        dragging = true;
        hovered = null;
        root.style.cursor = "grabbing";
        try {
          stage.setPointerCapture(event.pointerId);
        } catch {}
      }
      if (press.moved) {
        const cards = -dx / spacing();
        let next = pos + cards;
        if (!settingsRef.current.loop) {
          const over = next < 0 ? next : next > count() - 1 ? next - (count() - 1) : 0;
          if (over !== 0) next = pos + cards * 0.35;
        }
        const t = performance.now();
        const gapTime = Math.max((t - lastMoveAt) / 1000, 1 / 240);
        lastMoveAt = t;
        posV += ((next - pos) / gapTime - posV) * 0.5;
        press.samples.push({ t, d: next - pos });
        while (press.samples.length && t - press.samples[0].t > 100) press.samples.shift();
        pos = next;
      }
      press.lastX = event.clientX;
    }
    schedule();
  };

  const onDown = (event: PointerEvent) => {
    if (!settingsRef.current.draggable || !event.isPrimary || event.button > 0) return;
    press = { id: event.pointerId, x: event.clientX, lastX: event.clientX, moved: false, samples: [] };
    consumed = false;
    posV = 0;
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
      dragging = false;
      const now = performance.now();
      const recent = ended.samples.filter((sample) => now - sample.t < 100);
      let velocity = 0;
      if (recent.length > 1) {
        const span = Math.max((recent[recent.length - 1].t - recent[0].t) / 1000, 1 / 60);
        velocity = recent.reduce((sum, sample) => sum + sample.d, 0) / span;
      }
      posV = clamp(velocity, -12, 12);
      target = clampTarget(Math.round(pos + clamp(velocity, -12, 12) * 0.18));
      autoClock = 0;
      root.style.cursor = "";
    }
    schedule();
  };

  const onClick = (event: MouseEvent) => {
    if (consumed) {
      consumed = false;
      return;
    }
    const index = pickAt(event.clientX, event.clientY);
    if (index === null) return;
    if (index === Math.round(target)) {
      callbacks.onSelect(wrap(index));
    } else {
      target = clampTarget(index);
      autoClock = 0;
      schedule();
    }
  };

  const onLeave = (event: PointerEvent) => {
    if (press && press.id === event.pointerId) return;
    pointerInside = false;
    hovered = null;
    root.style.cursor = "";
    schedule();
  };

  const onWheel = (event: WheelEvent) => {
    if (!settingsRef.current.wheel) return;
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? height : 1;
    const delta = clamp((event.deltaY + event.deltaX) * unit, -240, 240);
    target = clampTarget((settle ? target : Math.round(target)) + delta / 100);
    settle = true;
    wheelAt = performance.now();
    autoClock = 0;
    schedule();
  };

  const onKey = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    } else if (event.key === "Enter" && event.target === root) {
      event.preventDefault();
      callbacks.onSelect(wrap(Math.round(target)));
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

  const resizer = new ResizeObserver(() => {
    if (resize()) schedule();
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

  resize();
  loadPictures();
  sweepStart = settingsRef.current.reduced ? -10 : 0.35;
  schedule();

  return {
    sync: () => {
      resize();
      loadPictures();
      if (!settingsRef.current.loop) target = clampTarget(target);
      last = 0;
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
      root.style.cursor = "";
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      pictures.forEach((picture) => {
        picture.image.onload = null;
        picture.texture.dispose();
      });
      slots.forEach((slot) => slot.mesh.material.dispose());
      blank.dispose();
      plane.dispose();
      renderer.dispose();
      if (!renderer.getContext().isContextLost()) renderer.forceContextLoss();
      canvas.remove();
    },
  };
};

export const PrismCarousel = forwardRef<PrismCarouselHandle, PrismCarouselProps>(function PrismCarousel(
  {
    items = defaultItems,
    startIndex = 0,
    aspect = 1.5,
    size = 0.62,
    neighborScale = 0.66,
    gap = 14,
    radius = 18,
    saturation = 0,
    dim = 0.2,
    sweep = 1,
    sweepDuration = 1.1,
    dispersion = 1,
    autoplay = true,
    interval = 4.5,
    loop = true,
    captions = true,
    controls = true,
    draggable = true,
    wheel = true,
    pauseOnHover = true,
    backgroundColor = "transparent",
    paused = false,
    dpr = 2,
    ariaLabel = "Prism carousel. Scroll, drag or use the arrow keys to move between images.",
    onIndexChange,
    onSelect,
    className,
    style,
  },
  ref,
) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<Controller | null>(null);
  const reduced = useSyncExternalStore(subscribeToMotion, readMotion, () => false);
  const list = items.length ? items : defaultItems;
  const itemsRef = useRef(list);
  const [initialIndex] = useState(() => clamp(Math.round(startIndex), 0, Math.max(list.length - 1, 0)));
  const [active, setActive] = useState(initialIndex);
  const [failed, setFailed] = useState(false);

  const settings: Settings = {
    items: list,
    aspect,
    size,
    neighborScale,
    gap,
    radius,
    saturation,
    dim,
    sweep,
    sweepDuration,
    dispersion,
    autoplay,
    interval,
    loop,
    captions,
    controls,
    draggable,
    wheel,
    pauseOnHover,
    backgroundColor,
    paused,
    dpr,
    reduced,
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
    if (!root || !stage) return;
    const controller = createPrism(
      root,
      stage,
      settingsRef,
      itemsRef,
      initialIndex,
      {
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
      },
    );
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

  useEffect(() => {
    const caption = captionRef.current;
    if (!caption || reduced) return;
    caption.animate(
      [
        { opacity: 0, transform: "translateY(6px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 460, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
  }, [active, reduced]);

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
      className={cn("relative h-full min-h-[420px] w-full overflow-hidden", className)}
      style={{ backgroundColor: transparent ? undefined : backgroundColor, color: ink, ...style }}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
    >
      <div ref={stageRef} style={stageStyle} />
      {failed && current ? (
        <div style={{ position: "absolute", inset: "12%", display: "grid", placeItems: "center" }}>
          <img
            src={current.src}
            alt={current.alt}
            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "cover", borderRadius: radius }}
          />
        </div>
      ) : null}
      <ul style={hiddenStyle}>
        {list.map((item, index) => (
          <li key={item.src} aria-current={index === active ? "true" : undefined}>
            {item.title ? `${item.title}: ${item.alt}` : item.alt}
          </li>
        ))}
      </ul>
      {captions || controls ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "var(--prism-caption-y, 82%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            pointerEvents: "none",
          }}
        >
          {captions && current ? (
            <div
              ref={captionRef}
              aria-live="polite"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, textAlign: "center" }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.35 }}>{current.title ?? current.alt}</span>
              {current.subtitle ? (
                <span style={{ fontSize: 13, opacity: 0.6, lineHeight: 1.35 }}>{current.subtitle}</span>
              ) : null}
            </div>
          ) : null}
          {controls ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                pointerEvents: "auto",
                fontSize: 12,
                fontVariantNumeric: "tabular-nums",
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
              <span style={{ opacity: 0.6, minWidth: 52, textAlign: "center" }}>
                {String(active + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}
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
      ) : null}
    </div>
  );
});

PrismCarousel.displayName = "PrismCarousel";

export default PrismCarousel;
