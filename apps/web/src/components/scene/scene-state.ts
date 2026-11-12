/**
 * Mutable state shared by the fixed scene layers (pond lens, 3D coin, crossfade).
 * It lives outside React on purpose: it changes every frame and must never trigger a re-render.
 */
export const sceneState = {
  /** Pointer position in uv space (origin bottom-left), kept after the pointer leaves. */
  u: 0.5,
  v: 0.5,
  /** Pointer mapped to -1..1 (up and right positive); 0 when the pointer is outside the window. */
  tx: 0,
  ty: 0,
  inside: false,
  /** False once the hero has faded out, so the pond shader stops drawing. */
  pondActive: true,
};

export function bindPointer(): () => void {
  const move = (event: PointerEvent) => {
    const u = event.clientX / Math.max(window.innerWidth, 1);
    const v = 1 - event.clientY / Math.max(window.innerHeight, 1);
    sceneState.u = u;
    sceneState.v = v;
    sceneState.tx = u * 2 - 1;
    sceneState.ty = v * 2 - 1;
    sceneState.inside = true;
  };
  const leave = () => {
    sceneState.inside = false;
    sceneState.tx = 0;
    sceneState.ty = 0;
  };
  window.addEventListener("pointermove", move, { passive: true });
  document.documentElement.addEventListener("pointerleave", leave);
  return () => {
    window.removeEventListener("pointermove", move);
    document.documentElement.removeEventListener("pointerleave", leave);
  };
}
