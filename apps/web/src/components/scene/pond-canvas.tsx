"use client";

import { useEffect, useRef } from "react";
import { sceneState } from "./scene-state";

const VERTEX = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

/**
 * The "ritual pond": a procedural night scene (candle skyline, stars, a perspective water plane
 * with rings spreading from the ritual point). Because it is computed per pixel it is sharp at any
 * resolution. The pointer ripple lens, with its red/blue split, wraps this scene.
 */
const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uPresence;
uniform vec2 uTilt;
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec3 scene(vec2 uv) {
  float asp = uRes.x / uRes.y;
  float hz = 0.58;
  vec3 deep = vec3(0.027, 0.039, 0.031);
  vec3 lime = vec3(0.718, 1.0, 0.086);
  vec3 green = vec3(0.0, 0.722, 0.353);
  vec3 col;

  if (uv.y > hz) {
    col = mix(vec3(0.050, 0.098, 0.064), deep * 0.7, smoothstep(hz, 1.0, uv.y));

    // stars
    vec2 sp = vec2(uv.x * asp, uv.y) * 62.0;
    vec2 id = floor(sp);
    vec2 f = fract(sp) - 0.5;
    float h = hash(id);
    vec2 jitter = (vec2(hash(id + 1.7), hash(id + 3.1)) - 0.5) * 0.5;
    float star = step(0.93, h) * (1.0 - smoothstep(0.0, 0.14, length(f - jitter)));
    float twinkle = 0.55 + 0.45 * sin(uTime * (0.6 + h * 1.4) + h * 40.0);
    col += vec3(0.82, 1.0, 0.84) * star * twinkle * 0.4 * smoothstep(hz + 0.02, 0.9, uv.y);

    // candle skyline on the horizon
    float cols = asp * 24.0;
    float cell = floor(uv.x * cols);
    float fx = fract(uv.x * cols);
    float ch = (0.012 + 0.1 * hash(vec2(cell, 7.0))) * (0.35 + 0.9 * uv.x);
    float body = step(0.2, fx) * step(fx, 0.8) * step(uv.y, hz + ch);
    float wick = step(0.46, fx) * step(fx, 0.54) * step(uv.y, hz + ch * 1.35);
    float candleAlpha = 0.1 + 0.12 * hash(vec2(cell, 11.0));
    col = mix(col, green, max(body, wick) * candleAlpha);
  } else {
    float dy = hz - uv.y;
    float k = 0.2;
    float z = k / dy;
    float x = (uv.x - 0.5) * asp * z * 1.6;
    float pw = max(z * z / k, z * 1.6) / uRes.y * 1.6;
    float fog = exp(-z * 0.12);

    col = mix(vec3(0.050, 0.100, 0.066), deep, 1.0 - smoothstep(0.0, hz, uv.y));

    // faint plane grid
    vec2 gp = vec2(x, z) * 0.8;
    vec2 gd = min(fract(gp), 1.0 - fract(gp)) / 0.8;
    float gridX = 1.0 - smoothstep(0.0, pw * 1.2 + 0.002, gd.x);
    float gridZ = 1.0 - smoothstep(0.0, pw * 1.2 + 0.002, gd.y);
    col += green * max(gridX, gridZ) * fog * 0.07 * (1.0 - smoothstep(3.0, 14.0, z));

    // rings spreading from the ritual point
    vec2 ctr = vec2(0.55, 1.6);
    float d = length(vec2(x, z) - ctr);
    float s = d * 1.15 - uTime * 0.1;
    float ringDist = min(fract(s), 1.0 - fract(s)) / 1.15;
    float line = 1.0 - smoothstep(0.0, pw + 0.0045, ringDist);
    float amp = exp(-d * 0.38) * (0.55 + 0.45 * hash(vec2(floor(s + 0.5), 3.0)));
    col += lime * line * amp * fog * 0.72;
    col += lime * exp(-d * d * 1.4) * fog * 0.1;
  }

  col += mix(green, lime, 0.4) * exp(-abs(uv.y - hz) * 55.0) * 0.2;
  return col;
}

void main() {
  float dist = distance(vUv, uMouse);
  float ripple = sin(dist * 20.0 - uTime * 5.0) * 0.006;
  float strength = (1.0 - smoothstep(0.0, 0.2, dist)) * uPresence;
  vec2 offset = normalize(vUv - uMouse + vec2(1e-5)) * ripple * strength;
  vec2 base = vUv + offset + uTilt;
  float r = scene(base + vec2(0.005, 0.0) * strength).r;
  float g = scene(base).g;
  float b = scene(base - vec2(0.005, 0.0) * strength).b;
  vec3 col = vec3(r, g, b);
  col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/** Draws the pond into a full-viewport canvas. Renders nothing (the CSS plate shows) without WebGL or with reduced motion. */
export function PondCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "high-performance",
    });
    if (!gl) return;

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uPresence = gl.getUniformLocation(program, "uPresence");
    const uTilt = gl.getUniformLocation(program, "uTilt");

    const resize = () => {
      const cap = window.innerWidth <= 820 ? 1.25 : 1.5;
      const ratio = Math.min(window.devicePixelRatio || 1, cap);
      canvas.width = Math.max(1, Math.round(window.innerWidth * ratio));
      canvas.height = Math.max(1, Math.round(window.innerHeight * ratio));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    let last = performance.now();
    const start = last;
    let presence = 0;
    let tx = 0;
    let ty = 0;
    let shown = false;
    let lost = false;

    const draw = (now: number) => {
      frame = window.requestAnimationFrame(draw);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (lost || !sceneState.pondActive || document.hidden) return;

      presence +=
        ((sceneState.inside ? 1 : 0) - presence) * (1 - Math.exp(-6 * dt));
      const ease = 1 - Math.exp(-dt / 0.1);
      tx += (sceneState.tx - tx) * ease;
      ty += (sceneState.ty - ty) * ease;

      gl.uniform1f(uTime, (now - start) / 1000);
      gl.uniform2f(uMouse, sceneState.u, sceneState.v);
      gl.uniform1f(uPresence, presence);
      gl.uniform2f(uTilt, tx * 0.009, ty * 0.009);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!shown) {
        shown = true;
        canvas.classList.add("is-live");
      }
    };
    frame = window.requestAnimationFrame(draw);

    const onLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      canvas.classList.remove("is-live");
    };
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, []);

  return <canvas ref={ref} className="scene-pond" aria-hidden="true" />;
}
