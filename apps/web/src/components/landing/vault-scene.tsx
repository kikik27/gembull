"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = {
  routedContribution: number;
  graduationContribution: number;
};

const LIME = 0xb7ff16;
const GOLD = 0xffc857;
const MAX_ROUTED_CONTRIBUTION = 12_000;

/** Schematic 3D objects: app router, graduation gate, and an empty glass reserve vessel. */
export function VaultScene({
  routedContribution,
  graduationContribution,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const valuesRef = useRef({ routedContribution, graduationContribution });
  const redrawRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    valuesRef.current = { routedContribution, graduationContribution };
    redrawRef.current?.();
  }, [routedContribution, graduationContribution]);

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
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
    camera.position.set(5.2, 4.1, 9.6);
    camera.lookAt(0, -0.1, 0);
    scene.add(new THREE.AmbientLight(0xe9ffdb, 1.7));
    const key = new THREE.PointLight(LIME, 28, 14);
    key.position.set(2, 4, 5);
    scene.add(key);
    const warm = new THREE.PointLight(GOLD, 16, 10);
    warm.position.set(-3, 2, -2);
    scene.add(warm);

    const model = new THREE.Group();
    scene.add(model);
    const dark = new THREE.MeshStandardMaterial({
      color: 0x142018,
      metalness: 0.65,
      roughness: 0.38,
    });
    const lime = new THREE.MeshStandardMaterial({
      color: LIME,
      metalness: 0.4,
      roughness: 0.3,
      emissive: 0x456f05,
      emissiveIntensity: 0.28,
    });
    const gold = new THREE.MeshStandardMaterial({
      color: GOLD,
      metalness: 0.48,
      roughness: 0.34,
      emissive: 0x7d4c00,
      emissiveIntensity: 0.16,
    });
    const glass = new THREE.MeshPhysicalMaterial({
      color: 0x9cb8a3,
      metalness: 0.05,
      roughness: 0.18,
      transparent: true,
      opacity: 0.09,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const frame = new THREE.LineBasicMaterial({
      color: 0x88bb89,
      transparent: true,
      opacity: 0.75,
    });
    const makeBox = (
      width: number,
      height: number,
      depth: number,
      material: THREE.Material,
      x: number,
      y: number,
      z: number,
      parent: THREE.Group = model,
    ) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        material,
      );
      mesh.position.set(x, y, z);
      parent.add(mesh);
      return mesh;
    };

    // A routed trade is represented by layered ledger cards on a platform.
    const router = new THREE.Group();
    router.position.set(-2.5, -0.42, 0.9);
    model.add(router);
    makeBox(1.65, 0.16, 1.28, dark, 0, -0.58, 0, router);
    for (let index = 0; index < 3; index += 1) {
      makeBox(1.22, 0.1, 0.86, index === 0 ? lime : dark, 0, -0.22 + index * 0.16, 0, router);
      makeBox(0.55, 0.018, 0.025, lime, -0.2, -0.16 + index * 0.16, 0.18, router);
    }

    // The graduation path is a separate gate, not part of the live router.
    const gate = new THREE.Group();
    gate.position.set(-2.5, -0.42, -1.38);
    model.add(gate);
    makeBox(1.65, 0.16, 1.12, dark, 0, -0.58, 0, gate);
    makeBox(0.16, 1.25, 0.18, gold, -0.56, 0.06, 0, gate);
    makeBox(0.16, 1.25, 0.18, gold, 0.56, 0.06, 0, gate);
    makeBox(1.28, 0.16, 0.22, gold, 0, 0.7, 0, gate);
    makeBox(0.6, 0.08, 0.48, dark, 0, -0.24, 0, gate);

    // The vessel only visualizes hypothetical reserve inputs; it contains no asset claim.
    const vessel = new THREE.Group();
    vessel.position.set(1.65, -0.42, -0.12);
    model.add(vessel);
    makeBox(2.25, 0.2, 1.85, dark, 0, -0.58, 0, vessel);
    const walls = makeBox(2.05, 1.8, 1.65, glass, 0, 0.4, 0, vessel);
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(walls.geometry),
      frame,
    );
    edges.position.copy(walls.position);
    vessel.add(edges);
    makeBox(2.2, 0.12, 1.8, dark, 0, 1.36, 0, vessel);
    const routedBar = makeBox(0.58, 1, 0.72, lime, -0.46, 0, 0, vessel);
    const graduationBar = makeBox(0.58, 1, 0.72, gold, 0.46, 0, 0, vessel);

    const routes = [
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.75, -0.52, 0.9),
        new THREE.Vector3(-0.6, -0.38, 0.65),
        new THREE.Vector3(0.85, -0.48, 0.28),
      ]),
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.75, -0.52, -1.38),
        new THREE.Vector3(-0.4, -0.28, -1.15),
        new THREE.Vector3(0.85, -0.48, -0.5),
      ]),
    ];
    const routeMaterials = [LIME, GOLD].map(
      (color) =>
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.45,
        }),
    );
    const packets = routes.map((route, index) => {
      const path = new THREE.Mesh(
        new THREE.TubeGeometry(route, 48, 0.025, 6, false),
        routeMaterials[index],
      );
      model.add(path);
      const packet = makeBox(
        0.16,
        0.16,
        0.16,
        index === 0 ? lime : gold,
        0,
        0,
        0,
      );
      return { route, packet };
    });

    const grid = new THREE.GridHelper(9, 18, 0x426746, 0x24402a);
    grid.position.y = -1.12;
    const gridMaterial = grid.material as THREE.Material;
    gridMaterial.transparent = true;
    gridMaterial.opacity = 0.28;
    model.add(grid);

    let frameId = 0;
    let visible = false;
    let pointerX = 0;
    let pointerY = 0;
    let routedHeight = 0;
    let graduationHeight = 0;
    const setBar = (bar: THREE.Mesh, height: number) => {
      bar.visible = height > 0.015;
      bar.scale.y = Math.max(height, 0.001);
      bar.position.y = -0.42 + height / 2;
    };
    const draw = (time: number) => {
      const values = valuesRef.current;
      const routedTarget =
        (Math.max(0, values.routedContribution) / MAX_ROUTED_CONTRIBUTION) * 1.35;
      const graduationTarget =
        (Math.max(0, values.graduationContribution) / MAX_ROUTED_CONTRIBUTION) * 1.35;
      const ease = reduced ? 1 : 0.09;
      routedHeight += (routedTarget - routedHeight) * ease;
      graduationHeight += (graduationTarget - graduationHeight) * ease;
      setBar(routedBar, routedHeight);
      setBar(graduationBar, graduationHeight);
      model.rotation.y += ((reduced ? 0 : pointerX * 0.08) - model.rotation.y) * ease;
      model.rotation.x += ((reduced ? 0 : -pointerY * 0.04) - model.rotation.x) * ease;
      packets.forEach(({ route, packet }, index) => {
        const amount = index === 0 ? values.routedContribution : values.graduationContribution;
        packet.visible = amount > 0;
        const phase = reduced ? 0.65 : (time * 0.00023 + index * 0.45) % 1;
        packet.position.copy(route.getPoint(phase));
      });
      renderer.render(scene, camera);
    };
    redrawRef.current = () => {
      if (reduced) draw(0);
    };
    const animate = (time: number) => {
      if (!visible) return;
      draw(time);
      frameId = window.requestAnimationFrame(animate);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !reduced && !frameId)
          frameId = window.requestAnimationFrame(animate);
        if (!visible && frameId) {
          window.cancelAnimationFrame(frameId);
          frameId = 0;
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
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    const layout = () => {
      const rect = canvas.getBoundingClientRect();
      renderer.setSize(Math.max(1, rect.width), Math.max(1, rect.height), false);
      camera.aspect = Math.max(1, rect.width) / Math.max(1, rect.height);
      camera.position.set(
        rect.width < 620 ? 5.7 : 5.2,
        rect.width < 620 ? 4.5 : 4.1,
        rect.width < 620 ? 12.8 : 9.6,
      );
      camera.lookAt(0, -0.1, 0);
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
      window.cancelAnimationFrame(frameId);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      redrawRef.current = null;
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
          object.geometry.dispose();
        }
      });
      [dark, lime, gold, glass, frame, ...routeMaterials, gridMaterial].forEach(
        (material) => material.dispose(),
      );
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="vault-canvas" aria-hidden="true" />;
}
