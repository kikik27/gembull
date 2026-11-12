"use client";

import { useEffect, useRef } from "react";
import { CoinCanvas } from "./coin-canvas";
import { PondCanvas } from "./pond-canvas";
import { bindPointer, sceneState } from "./scene-state";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (a: number, b: number, value: number) => {
  const t = clamp((value - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/**
 * The fixed full-viewport scene behind the page: the ritual pond (hero), a deep green field for the
 * middle sections, and a night pond behind the footer, with the 3D coin on top. Layers crossfade on scroll.
 */
export function SceneStack() {
  const dayRef = useRef<HTMLDivElement>(null);
  const deepRef = useRef<HTMLDivElement>(null);
  const nightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unbind = bindPointer();
    let endTop = 0;
    let frame = 0;

    const measure = () => {
      const end = document.getElementById("end");
      endTop = end
        ? end.getBoundingClientRect().top + window.scrollY
        : document.documentElement.scrollHeight;
    };

    const update = () => {
      frame = 0;
      const h = window.innerHeight;
      const y = window.scrollY;
      const toDeep = smoothstep(0.15 * h, 1.05 * h, y);
      const toNight = smoothstep(endTop - 1.1 * h, endTop - 0.1 * h, y);

      const day = dayRef.current;
      if (day) {
        day.style.opacity = String(1 - toDeep);
        const zoom = 1 + 0.08 * toDeep;
        // Parallax is capped by the zoom overshoot so the layer never exposes its edge.
        const lift = Math.min(0.06 * y, (zoom - 1) * h * 0.5 * 0.95);
        day.style.transform = `scale(${zoom}) translateY(${(-lift).toFixed(1)}px)`;
      }
      if (deepRef.current)
        deepRef.current.style.opacity = String(toDeep * (1 - toNight));
      if (nightRef.current) nightRef.current.style.opacity = String(toNight);

      document.documentElement.dataset.scrolled =
        y > 0.5 * h ? "true" : "false";
      sceneState.pondActive = toDeep < 0.999;
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      schedule();
    };

    measure();
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onResize);
    // Section heights settle after fonts and live data arrive.
    const settle = window.setTimeout(onResize, 800);
    const lateSettle = window.setTimeout(onResize, 3000);

    return () => {
      unbind();
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      window.clearTimeout(lateSettle);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
    };
  }, []);

  return (
    <div className="scene" aria-hidden="true">
      <div className="scene-layer scene-day" ref={dayRef}>
        <PondCanvas />
      </div>
      <div className="scene-layer scene-deep" ref={deepRef} />
      <div className="scene-layer scene-night" ref={nightRef} />
      <CoinCanvas />
    </div>
  );
}
