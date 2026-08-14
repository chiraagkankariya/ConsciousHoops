import { useEffect, useRef } from "react";
import { geoOrthographic, geoPath, geoGraticule } from "d3-geo";
import { timer } from "d3-timer";

interface Props {
  size?: number;
  className?: string;
}

// Brand palette (dark mode)
const SAND = "#1A1A1E";
const SAND_DARK = "rgba(255,255,255,0.14)";
const TERRA = "#E8613A";
const CHARCOAL = "#F2EEE6";

// Build a seam path as array of [lng, lat] samples.
// Returns ~`steps` points around a full great-circle-like loop.
function buildSeams(): [number, number][][] {
  const steps = 240;
  const seams: [number, number][][] = [];

  // 1. Equator seam
  const equator: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const lng = -180 + (360 * i) / steps;
    equator.push([lng, 0]);
  }
  seams.push(equator);

  // 2 & 3. Two perpendicular meridian seams (full great circles through the poles)
  for (const lngOffset of [0, 90]) {
    const meridian: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      // parameterize as a great circle: lat goes -90→90→-90
      const t = (i / steps) * 2 * Math.PI;
      const lat = Math.asin(Math.sin(t)) * (180 / Math.PI); // triangle-ish? use simpler full circle:
      // Actually use a true great-circle through poles offset at lngOffset:
      const trueLat = 90 - (360 * i) / steps;
      const lng = trueLat >= -90 && trueLat <= 90 ? lngOffset : lngOffset + 180;
      // simpler: walk lat -90→90 along lngOffset, then 90→-90 along lngOffset+180
      void lat;
      void lng;
      void trueLat;
    }
    // Cleaner approach below:
    meridian.length = 0;
    const half = steps / 2;
    for (let i = 0; i <= half; i++) {
      const lat = -90 + (180 * i) / half;
      meridian.push([lngOffset, lat]);
    }
    for (let i = 1; i <= half; i++) {
      const lat = 90 - (180 * i) / half;
      meridian.push([lngOffset + 180, lat]);
    }
    seams.push(meridian);
  }

  // 4 & 5. The two classic curved side seams — meridians bent with a sine wave
  // for the basketball "S-curve" look. Centered at lng = 45 and 135 (between
  // the straight perpendicular seams).
  for (const center of [45, 135]) {
    const curve: [number, number][] = [];
    const half = steps / 2;
    // front half: lat -90→90, lng = center + amplitude * sin
    for (let i = 0; i <= half; i++) {
      const lat = -90 + (180 * i) / half;
      const lng = center + 35 * Math.sin((lat * Math.PI) / 90);
      curve.push([lng, lat]);
    }
    // back half: lat 90→-90, lng on opposite side mirrored
    for (let i = 1; i <= half; i++) {
      const lat = 90 - (180 * i) / half;
      const lng = center + 180 - 35 * Math.sin((lat * Math.PI) / 90);
      curve.push([lng, lat]);
    }
    seams.push(curve);
  }

  return seams;
}

export default function WireframeBasketball({ size = 420, className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = size;
    const h = size;
    const baseRadius = size / 2.4;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const projection = geoOrthographic()
      .scale(baseRadius)
      .translate([w / 2, h / 2])
      .clipAngle(90);

    const path = geoPath(projection, ctx);
    const graticule = geoGraticule().step([15, 15]);
    const seams = buildSeams();

    const rotation: [number, number] = [0, -10];
    let autoRotate = true;
    const rotationSpeed = 0.12;

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      const scale = projection.scale();
      const sf = scale / baseRadius;

      // Sphere fill
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, scale, 0, 2 * Math.PI);
      ctx.fillStyle = SAND;
      ctx.fill();

      // Graticule
      ctx.beginPath();
      path(graticule());
      ctx.strokeStyle = SAND_DARK;
      ctx.lineWidth = 1 * sf;
      ctx.globalAlpha = 0.35;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Outer rim
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, scale, 0, 2 * Math.PI);
      ctx.strokeStyle = CHARCOAL;
      ctx.lineWidth = 2 * sf;
      ctx.stroke();

      // Seam dots
      const dotR = 1.8 * sf;
      ctx.fillStyle = TERRA;
      for (const seam of seams) {
        for (const coord of seam) {
          const p = projection(coord);
          if (!p) continue;
          ctx.beginPath();
          ctx.arc(p[0], p[1], dotR, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    };

    const t = timer(() => {
      if (autoRotate) {
        rotation[0] += rotationSpeed;
        projection.rotate(rotation);
        render();
      }
    });

    // Track active pointers to support pinch-zoom on touch devices.
    const pointers = new Map<number, { x: number; y: number }>();
    let pinchStartDist = 0;
    let pinchStartScale = 0;
    let dragStart: { x: number; y: number; rot: [number, number] } | null = null;

    const onPointerDown = (e: PointerEvent) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      autoRotate = false;
      try { canvas.setPointerCapture(e.pointerId); } catch { /* ignore */ }

      if (pointers.size === 2) {
        // Start pinch
        const [a, b] = Array.from(pointers.values());
        pinchStartDist = Math.hypot(b.x - a.x, b.y - a.y);
        pinchStartScale = projection.scale();
        dragStart = null;
      } else if (pointers.size === 1) {
        dragStart = { x: e.clientX, y: e.clientY, rot: [rotation[0], rotation[1]] };
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.size === 2 && pinchStartDist > 0) {
        const [a, b] = Array.from(pointers.values());
        const dist = Math.hypot(b.x - a.x, b.y - a.y);
        const next = Math.max(baseRadius * 0.5, Math.min(baseRadius * 3, pinchStartScale * (dist / pinchStartDist)));
        projection.scale(next);
        render();
      } else if (pointers.size === 1 && dragStart) {
        const sensitivity = 0.4;
        rotation[0] = dragStart.rot[0] + (e.clientX - dragStart.x) * sensitivity;
        rotation[1] = Math.max(-90, Math.min(90, dragStart.rot[1] - (e.clientY - dragStart.y) * sensitivity));
        projection.rotate(rotation);
        render();
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      try { canvas.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
      if (pointers.size < 2) pinchStartDist = 0;
      if (pointers.size === 0) {
        dragStart = null;
        setTimeout(() => { autoRotate = true; }, 800);
      }
    };

    const onWheel = (e: WheelEvent) => {
      // Only hijack scroll when the user explicitly intends to zoom:
      // trackpad pinch fires wheel with ctrlKey, and Cmd/Ctrl+scroll is the
      // conventional zoom modifier. Otherwise let the page scroll naturally.
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.92 : 1.08;
      const next = Math.max(baseRadius * 0.5, Math.min(baseRadius * 3, projection.scale() * factor));
      projection.scale(next);
      render();
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    projection.rotate(rotation);
    render();

    return () => {
      t.stop();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [size]);

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <canvas
        ref={canvasRef}
        // pan-y lets vertical page scroll pass through when the user swipes
        // over the canvas on touch devices; horizontal drag still rotates,
        // and two-finger pinch zooms (handled via pointer events).
        className="cursor-grab touch-pan-y select-none active:cursor-grabbing"
        aria-label="Spinning wireframe basketball"
        role="img"
      />
      <span className="mt-6 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-text backdrop-blur-sm">
        Drag to spin · Pinch to zoom
      </span>
    </div>
  );
}
