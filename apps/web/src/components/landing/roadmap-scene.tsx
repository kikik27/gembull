"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import * as THREE from "three";

type Props = {
  active: number;
  onSelect: (index: number) => void;
};

const FLAG_COLORS = [0xb7ff16, 0xf4f7f2, 0xffc857] as const;
const FLAG_STOPS = [0.12, 0.5, 0.98] as const;
const CAR_STOPS = [0.02, 0.42, 0.9] as const;

function roadRibbon(curve: THREE.CatmullRomCurve3, width: number, height: number) {
  const positions: number[] = [];
  const indices: number[] = [];
  const segments = 100;
  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments;
    const point = curve.getPoint(t);
    const tangent = curve.getTangent(t).normalize();
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x);
    const left = point.clone().addScaledVector(normal, width / 2);
    const right = point.clone().addScaledVector(normal, -width / 2);
    positions.push(left.x, height, left.z, right.x, height, right.z);
    if (index < segments) {
      const start = index * 2;
      indices.push(start, start + 1, start + 2, start + 1, start + 3, start + 2);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** A small map: curved road, three flag pins, and the GemBull mascot driving to the selected stop. */
export function RoadmapScene({ active, onSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const carRef = useRef<HTMLImageElement>(null);
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
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
    scene.add(new THREE.AmbientLight(0xe8ffe6, 1.7));
    const light = new THREE.DirectionalLight(0xd4ff9d, 2.1);
    light.position.set(-3, 7, 5);
    scene.add(light);
    const map = new THREE.Group();
    scene.add(map);

    const road = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.4, 0, 1.42),
      new THREE.Vector3(-2.45, 0, 1.26),
      new THREE.Vector3(-1.35, 0, -0.72),
      new THREE.Vector3(0, 0, -0.85),
      new THREE.Vector3(1.15, 0, 0.72),
      new THREE.Vector3(2.18, 0, 1.02),
      new THREE.Vector3(3.35, 0, -0.12),
    ]);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(8.65, 5.1),
      new THREE.MeshStandardMaterial({
        color: 0x102016,
        roughness: 1,
        metalness: 0,
        transparent: true,
        opacity: 0.64,
        side: THREE.DoubleSide,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.065;
    map.add(ground);
    const grid = new THREE.GridHelper(8.5, 18, 0x345b39, 0x1e3a25);
    grid.position.y = -0.043;
    const gridMaterial = grid.material as THREE.Material;
    gridMaterial.transparent = true;
    gridMaterial.opacity = 0.32;
    map.add(grid);
    map.add(
      new THREE.Mesh(
        roadRibbon(road, 0.94, -0.015),
        new THREE.MeshBasicMaterial({ color: 0x53794c, side: THREE.DoubleSide }),
      ),
      new THREE.Mesh(
        roadRibbon(road, 0.8, 0.002),
        new THREE.MeshBasicMaterial({ color: 0x18251b, side: THREE.DoubleSide }),
      ),
    );
    const dashMaterial = new THREE.MeshBasicMaterial({
      color: 0xe3efde,
      transparent: true,
      opacity: 0.52,
    });
    for (let index = 0; index < 19; index += 1) {
      const t = 0.035 + index * 0.051;
      const point = road.getPoint(t);
      const tangent = road.getTangent(t);
      const dash = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.014, 0.025),
        dashMaterial,
      );
      dash.position.set(point.x, 0.025, point.z);
      dash.rotation.y = -Math.atan2(tangent.z, tangent.x);
      map.add(dash);
    }

    const clickTargets: THREE.Object3D[] = [];
    const flags = FLAG_STOPS.map((stop, index) => {
      const point = road.getPoint(stop);
      const holder = new THREE.Group();
      holder.position.set(point.x, 0, point.z);
      map.add(holder);
      const color = FLAG_COLORS[index];
      const ringMaterial = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.37, 0.027, 8, 44),
        ringMaterial,
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.035;
      holder.add(ring);
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.024, 0.035, 1.13, 10),
        new THREE.MeshStandardMaterial({
          color: 0xdbe8da,
          metalness: 0.6,
          roughness: 0.32,
        }),
      );
      pole.position.y = 0.62;
      holder.add(pole);
      const flagMaterial = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.24,
        metalness: 0.2,
        roughness: 0.38,
        side: THREE.DoubleSide,
      });
      const flagShape = new THREE.Shape();
      flagShape.moveTo(0, 0);
      flagShape.lineTo(0.54, 0);
      flagShape.lineTo(0.4, -0.18);
      flagShape.lineTo(0.54, -0.36);
      flagShape.lineTo(0, -0.36);
      flagShape.closePath();
      const flag = new THREE.Mesh(
        new THREE.ShapeGeometry(flagShape),
        flagMaterial,
      );
      flag.position.set(0.02, 1.13, 0);
      holder.add(flag);
      for (const target of [ring, pole, flag]) {
        target.userData.milestoneIndex = index;
        clickTargets.push(target);
      }
      return { holder, ring, ringMaterial, flagMaterial };
    });

    let progress = CAR_STOPS[activeRef.current] ?? CAR_STOPS[0];
    let frame = 0;
    let visible = false;
    let pointerX = 0;
    let pointerY = 0;
    const draw = (time: number) => {
      const selected = activeRef.current;
      const target = CAR_STOPS[selected] ?? CAR_STOPS[0];
      progress += (target - progress) * (reduced ? 1 : 0.055);
      const point = road.getPoint(progress);
      const carPosition = new THREE.Vector3(
        point.x,
        0.78 + (reduced ? 0 : Math.sin(time * 0.004) * 0.025),
        point.z,
      );
      const projected = carPosition.project(camera);
      if (carRef.current) {
        carRef.current.style.left = `${(projected.x + 1) * 50}%`;
        carRef.current.style.top = `${(1 - projected.y) * 50}%`;
      }
      flags.forEach((flag, index) => {
        const chosen = index === selected;
        const scale = chosen ? 1.16 : 0.92;
        flag.holder.scale.lerp(
          new THREE.Vector3(scale, scale, scale),
          reduced ? 1 : 0.1,
        );
        flag.ringMaterial.opacity +=
          ((chosen ? 0.95 : 0.36) - flag.ringMaterial.opacity) *
          (reduced ? 1 : 0.1);
        flag.flagMaterial.emissiveIntensity +=
          ((chosen ? 0.52 : 0.13) - flag.flagMaterial.emissiveIntensity) *
          (reduced ? 1 : 0.1);
      });
      const ease = reduced ? 1 : 0.06;
      map.rotation.y += ((reduced ? 0 : pointerX * 0.055) - map.rotation.y) * ease;
      map.rotation.x += ((reduced ? 0 : -pointerY * 0.025) - map.rotation.x) * ease;
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
      const hit = raycaster.intersectObjects(clickTargets)[0];
      if (hit && typeof hit.object.userData.milestoneIndex === "number")
        selectRef.current(hit.object.userData.milestoneIndex);
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("click", onClick);
    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false);
      camera.aspect = Math.max(1, rect.width) / Math.max(1, rect.height);
      const mobile = rect.width < 620;
      camera.position.set(0, mobile ? 7.5 : 6.2, mobile ? 10.2 : 8.5);
      camera.lookAt(0, 0.05, 0.2);
      camera.updateProjectionMatrix();
      redrawRef.current?.();
    };
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
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      map.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
          geometries.add(object.geometry);
          const assigned = Array.isArray(object.material)
            ? object.material
            : [object.material];
          assigned.forEach((material) => materials.add(material));
        }
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="roadmap-canvas" aria-hidden="true" />
      <Image
        ref={carRef}
        src="/brand/scene/gembull-roadster-mascot.png"
        alt=""
        aria-hidden="true"
        className="roadmap-car"
        width={1312}
        height={1199}
        priority
        unoptimized
      />
    </>
  );
}
