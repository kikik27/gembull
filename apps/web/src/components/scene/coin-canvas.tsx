"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { poseAt, resolveAnchors, type Pose } from "./poses";
import { sceneState } from "./scene-state";

const TAU = Math.PI * 2;
const FACE_RADIUS = 0.4;

/** Prepares the coin face; the approved GemBull icon is added after it loads. */
function paintCoinFace(size: number) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const center = size / 2;
  const disc = ctx.createRadialGradient(center, center, size / 32, center, center, center);
  disc.addColorStop(0, "#142016");
  disc.addColorStop(1, "#070a08");
  ctx.fillStyle = disc;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

/**
 * A decorative GemBull coin on a fixed transparent canvas. It travels between one pose per section as
 * the page scrolls, flips with scroll velocity, and leans slightly toward the pointer.
 */
export function CoinCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = environment.texture;

    scene.add(new THREE.HemisphereLight(0xdfffe0, 0x0b200c, 0.7));
    const key = new THREE.DirectionalLight(0xf6ffd6, 1.6);
    key.position.set(3, 5, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x00b85a, 2.8);
    rim.position.set(-5, -1, -4);
    scene.add(rim);

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 10);

    const faceCanvas = paintCoinFace(2048);
    const faceTexture = new THREE.CanvasTexture(faceCanvas);
    faceTexture.colorSpace = THREE.SRGBColorSpace;
    faceTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const logoImage = new window.Image();
    logoImage.onload = () => {
      const ctx = faceCanvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(logoImage, 0, 0, faceCanvas.width, faceCanvas.height);
      faceTexture.needsUpdate = true;
      if (reduced) renderer.render(scene, camera);
    };
    logoImage.src = "/brand/icons/gembull-app-icon.png";

    const faceY = 0.042;
    const half = 0.06;
    const profile = [
      [0, -faceY],
      [0.4, -faceY],
      [0.43, -half],
      [0.485, -half],
      [0.5, -half + 0.016],
      [0.5, half - 0.016],
      [0.485, half],
      [0.43, half],
      [0.4, faceY],
      [0, faceY],
    ].map(([r, y]) => new THREE.Vector2(r, y));
    const bodyGeometry = new THREE.LatheGeometry(profile, 128);
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xb7ff16,
      metalness: 0.9,
      roughness: 0.24,
      clearcoat: 0.5,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1.1,
      emissive: 0x1a3300,
      emissiveIntensity: 0.5,
      side: THREE.DoubleSide,
    });
    const faceGeometry = new THREE.CircleGeometry(FACE_RADIUS, 96);
    const faceMaterial = new THREE.MeshStandardMaterial({
      map: faceTexture,
      emissiveMap: faceTexture,
      emissive: 0xffffff,
      emissiveIntensity: 0.45,
      roughness: 0.45,
      metalness: 0.1,
    });

    const coin = new THREE.Group();
    coin.add(new THREE.Mesh(bodyGeometry, bodyMaterial));
    const front = new THREE.Mesh(faceGeometry, faceMaterial);
    front.rotation.x = -Math.PI / 2;
    front.position.y = faceY + 0.0007;
    const back = new THREE.Mesh(faceGeometry, faceMaterial);
    back.rotation.x = Math.PI / 2;
    back.position.y = -faceY - 0.0007;
    coin.add(front, back);
    // The lathe axis is Y; stand the coin up so its face looks at the camera.
    coin.rotation.x = Math.PI / 2;

    const body = new THREE.Group();
    body.add(coin);
    const rig = new THREE.Group();
    rig.add(body);
    scene.add(rig);

    let anchors = resolveAnchors();
    let phone = window.innerWidth <= 820;
    let width = 1;
    let height = 1;
    let frustumHeight = 1;
    let frustumWidth = 1;
    let current: Pose | null = null;
    let flip = 0;
    let tiltX = 0;
    let tiltY = 0;
    let lastScrollY = window.scrollY;
    let velocity = 0;
    let frame = 0;
    let last = performance.now();
    const start = last;

    const layout = () => {
      width = Math.max(window.innerWidth, 1);
      height = Math.max(window.innerHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      frustumHeight =
        2 * Math.tan(THREE.MathUtils.degToRad(15)) * camera.position.z;
      frustumWidth = frustumHeight * camera.aspect;
      phone = width <= 820;
      anchors = resolveAnchors();
    };

    const apply = (pose: Pose, time: number) => {
      const bob = reduced ? 0 : Math.sin(0.9 * time) * 0.018;
      rig.position.set(
        (pose.x * frustumWidth) / 2,
        ((pose.y + bob) * frustumHeight) / 2,
        0,
      );
      rig.rotation.set(
        pose.roll + (reduced ? 0 : Math.sin(0.7 * time) * 0.04),
        pose.yaw + (reduced ? 0 : Math.sin(0.5 * time) * 0.06) + flip,
        pose.pitch,
      );
      body.scale.setScalar(pose.s * frustumHeight);
    };

    const render = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const time = (now - start) / 1000;
      const target = poseAt(anchors, window.scrollY, phone);

      if (!current || reduced) {
        current = { ...target };
      } else {
        const k = 1 - Math.exp(-3.2 * dt);
        current = {
          x: current.x + (target.x - current.x) * k,
          y: current.y + (target.y - current.y) * k,
          s: current.s + (target.s - current.s) * k,
          yaw: current.yaw + (target.yaw - current.yaw) * k,
          pitch: current.pitch + (target.pitch - current.pitch) * k,
          roll: current.roll + (target.roll - current.roll) * k,
        };
      }

      if (!reduced && dt > 0) {
        const scrollY = window.scrollY;
        velocity += ((scrollY - lastScrollY) / dt - velocity) * 0.1;
        lastScrollY = scrollY;
        flip += velocity * dt * 0.0016;
        const settled = Math.round(flip / TAU) * TAU;
        flip += (settled - flip) * (1 - Math.exp(-dt * 2.2));
      }

      const ease = reduced ? 1 : 1 - Math.exp(-dt / 0.1);
      tiltX += (-sceneState.tx * 0.01745 - tiltX) * ease;
      tiltY += (sceneState.ty * 0.01745 - tiltY) * ease;
      camera.rotation.y = tiltX;
      camera.rotation.x = tiltY;

      apply(current, time);
      renderer.render(scene, camera);
    };

    const loop = (now: number) => {
      frame = window.requestAnimationFrame(loop);
      if (document.hidden) {
        last = now;
        return;
      }
      render(now);
    };
    const onScrollOnce = () => render(performance.now());
    const onResize = () => {
      layout();
      render(performance.now());
    };

    layout();
    render(performance.now());
    if (reduced) {
      window.addEventListener("scroll", onScrollOnce, { passive: true });
    } else {
      frame = window.requestAnimationFrame(loop);
    }
    window.addEventListener("resize", onResize);
    // Section heights settle after fonts and data load; recompute anchors shortly after.
    const settle = window.setTimeout(onResize, 600);
    const lateSettle = window.setTimeout(onResize, 2500);
    window.addEventListener("load", onResize);

    return () => {
      logoImage.onload = null;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      window.clearTimeout(lateSettle);
      window.removeEventListener("scroll", onScrollOnce);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
      bodyGeometry.dispose();
      faceGeometry.dispose();
      bodyMaterial.dispose();
      faceMaterial.dispose();
      faceTexture.dispose();
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={ref} className="scene-coin" aria-hidden="true" />;
}
