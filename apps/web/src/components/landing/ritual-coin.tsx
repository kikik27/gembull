"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as THREE from "three";

/** A slow-turning RITL coin. Decorative: the static token icon shows until WebGL is ready, or when it is unavailable. */
export default function RitualCoin() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.z = 6.4;
    scene.add(new THREE.AmbientLight(0xffffff, 1.4));
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(2.5, 3, 4);
    scene.add(key);

    const texture = new THREE.TextureLoader().load("/brand/icons/ritl-token-icon-512.png", () => {
      render();
      setReady(true);
    });
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;

    const geometry = new THREE.CylinderGeometry(1.5, 1.5, 0.2, 96);
    const rim = new THREE.MeshStandardMaterial({ color: 0x0b0f0a, metalness: 0.5, roughness: 0.4 });
    const face = new THREE.MeshBasicMaterial({ map: texture });
    const coin = new THREE.Mesh(geometry, [rim, face, face]);
    coin.rotation.x = Math.PI / 2;
    const group = new THREE.Group();
    group.add(coin);
    scene.add(group);

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = true;
    let tiltX = 0;
    let tiltY = 0;

    function render() {
      renderer.render(scene, camera);
    }
    const tick = (time: number) => {
      frame = 0;
      group.rotation.y = time * 0.00085 + tiltY;
      group.rotation.x = Math.sin(time * 0.0006) * 0.14 + tiltX;
      render();
      if (visible && !motionPreference.matches) frame = window.requestAnimationFrame(tick);
    };
    const stop = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    };
    const start = () => {
      if (visible && !motionPreference.matches && !frame) frame = window.requestAnimationFrame(tick);
      else {
        group.rotation.set(0.1, -0.45, 0);
        render();
      }
    };
    const resize = () => {
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      render();
    };
    const onPointerMove = (event: PointerEvent) => {
      const bounds = host.getBoundingClientRect();
      tiltY = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.9;
      tiltX = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.5;
    };
    const onPointerLeave = () => {
      tiltX = 0;
      tiltY = 0;
    };
    const onMotionChange = () => {
      stop();
      start();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    visibilityObserver.observe(host);
    host.addEventListener("pointermove", onPointerMove);
    host.addEventListener("pointerleave", onPointerLeave);
    motionPreference.addEventListener("change", onMotionChange);
    resize();
    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onPointerLeave);
      motionPreference.removeEventListener("change", onMotionChange);
      geometry.dispose();
      rim.dispose();
      face.dispose();
      texture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div className="coin-stage" ref={hostRef} aria-hidden="true">
      {!ready && <Image src="/brand/icons/ritl-token-icon-512.png" width={512} height={512} alt="" />}
    </div>
  );
}
