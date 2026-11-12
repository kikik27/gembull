"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = {
  active: number;
  onSelect: (index: number) => void;
};

const COLORS = [0xb7ff16, 0xf4f7f2, 0x749579] as const;
const DESKTOP_POINTS = [
  new THREE.Vector3(-2.55, -0.42, 0.15),
  new THREE.Vector3(0, 0.52, -0.35),
  new THREE.Vector3(2.55, -0.3, 0.1),
];
const MOBILE_POINTS = [
  new THREE.Vector3(-1.65, -0.25, 0.15),
  new THREE.Vector3(0, 0.45, -0.35),
  new THREE.Vector3(1.65, -0.2, 0.1),
];

/** A small WebGL map of the three documented roadmap states. Text controls remain usable without WebGL. */
export function RoadmapScene({ active, onSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const selectRef = useRef(onSelect);
  const redrawRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    activeRef.current = active;
    redrawRef.current?.();
  }, [active]);
  useEffect(() => {
    selectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch {
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    scene.add(new THREE.AmbientLight(0xdcebdc, 1.45));
    const light = new THREE.PointLight(0xb7ff16, 35, 14);
    light.position.set(-2, 2, 5);
    scene.add(light);
    const group = new THREE.Group();
    scene.add(group);

    const nodes = COLORS.map((color, index) => {
      const holder = new THREE.Group();
      const coreMaterial = new THREE.MeshStandardMaterial({
        color,
        metalness: 0.62,
        roughness: 0.24,
        flatShading: true,
        emissive: color,
        emissiveIntensity: 0.16,
      });
      const geometry =
        index === 0
          ? new THREE.IcosahedronGeometry(0.52, 1)
          : index === 1
            ? new THREE.OctahedronGeometry(0.54, 1)
            : new THREE.BoxGeometry(0.78, 0.78, 0.78);
      const core = new THREE.Mesh(geometry, coreMaterial);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: index === 0 ? 0xb7ff16 : 0x6d8970,
        transparent: true,
        opacity: 0.42,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.78, 0.014, 8, 64),
        ringMaterial,
      );
      ring.rotation.x = 0.35;
      holder.add(core, ring);
      group.add(holder);
      return { holder, core, coreMaterial, ring, ringMaterial };
    });

    const trackMaterial = new THREE.MeshBasicMaterial({
      color: 0x35553a,
      transparent: true,
      opacity: 0.9,
    });
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xb7ff16,
      transparent: true,
      opacity: 0.1,
    });
    const track = new THREE.Mesh(new THREE.BufferGeometry(), trackMaterial);
    const glow = new THREE.Mesh(new THREE.BufferGeometry(), glowMaterial);
    group.add(glow, track);
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.085, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0xd4ff59 }),
    );
    group.add(marker);

    let curve = new THREE.CatmullRomCurve3(DESKTOP_POINTS);
    let width = 1;
    let height = 1;
    let pointerX = 0;
    let pointerY = 0;
    let progress = 0;
    let frame = 0;
    let visible = false;

    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const mobile = width < 620;
      const points = mobile ? MOBILE_POINTS : DESKTOP_POINTS;
      nodes.forEach((node, index) => node.holder.position.copy(points[index]));
      curve = new THREE.CatmullRomCurve3(points);
      track.geometry.dispose();
      glow.geometry.dispose();
      track.geometry = new THREE.TubeGeometry(curve, 80, 0.015, 6, false);
      glow.geometry = new THREE.TubeGeometry(curve, 80, 0.085, 8, false);
      camera.aspect = width / height;
      camera.position.set(0, 0, mobile ? 9.7 : 9.2);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      redrawRef.current?.();
    };

    const draw = (time: number) => {
      const selected = activeRef.current;
      const ease = reduced ? 1 : 0.08;
      group.rotation.y += ((reduced ? 0 : pointerX * 0.13) - group.rotation.y) * ease;
      group.rotation.x += ((reduced ? 0 : -pointerY * 0.08) - group.rotation.x) * ease;
      nodes.forEach((node, index) => {
        const chosen = index === selected;
        const size = chosen ? 1.16 : 0.9;
        node.holder.scale.lerp(
          new THREE.Vector3(size, size, size),
          reduced ? 1 : 0.1,
        );
        node.core.rotation.y = reduced ? 0.25 : time * 0.00022 * (index + 1);
        node.core.rotation.z = reduced ? 0.1 : time * 0.00013;
        node.ring.rotation.z = reduced ? 0 : time * 0.00012 * (index % 2 ? -1 : 1);
        node.coreMaterial.emissiveIntensity +=
          ((chosen ? 0.58 : 0.1) - node.coreMaterial.emissiveIntensity) * ease;
        node.ringMaterial.opacity +=
          ((chosen ? 0.9 : 0.28) - node.ringMaterial.opacity) * ease;
      });
      progress += (selected / 2 - progress) * (reduced ? 1 : 0.08);
      marker.position.copy(curve.getPoint(progress));
      camera.position.x +=
        ((selected - 1) * 0.13 - camera.position.x) * ease;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };

    redrawRef.current = () => {
      if (reduced) draw(0);
    };
    const animate = (time: number) => {
      if (!visible) return;
      draw(time);
      frame = window.requestAnimationFrame(animate);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !reduced && !frame)
          frame = window.requestAnimationFrame(animate);
        if (!visible && frame) {
          window.cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { threshold: 0.05 },
    );
    observer.observe(canvas);

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    };
    const onLeave = () => {
      pointerX = 0;
      pointerY = 0;
    };
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const onClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(nodes.map((node) => node.core))[0];
      if (hit) {
        const index = nodes.findIndex((node) => node.core === hit.object);
        if (index >= 0) selectRef.current(index);
      }
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("click", onClick);
    const resizeObserver = new ResizeObserver(layout);
    resizeObserver.observe(canvas);
    layout();
    draw(0);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      window.cancelAnimationFrame(frame);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("click", onClick);
      redrawRef.current = null;
      nodes.forEach((node) => {
        node.core.geometry.dispose();
        node.coreMaterial.dispose();
        node.ring.geometry.dispose();
        node.ringMaterial.dispose();
      });
      track.geometry.dispose();
      glow.geometry.dispose();
      trackMaterial.dispose();
      glowMaterial.dispose();
      marker.geometry.dispose();
      (marker.material as THREE.Material).dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="roadmap-canvas"
      aria-hidden="true"
    />
  );
}
