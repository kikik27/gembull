/**
 * Scroll choreography for the 3D coin: one pose per section.
 * x and y are in half-viewport units (-1..1, x right, y up); s is the coin diameter as a share of
 * viewport height; yaw turns it about the vertical axis, pitch tilts it in the screen plane, roll about X.
 */
export type Pose = {
  x: number;
  y: number;
  s: number;
  yaw: number;
  pitch: number;
  roll: number;
};

export type PoseKey =
  "hero" | "studio" | "dash" | "how" | "roles" | "under" | "end";

export const DESKTOP_POSES: Record<PoseKey, Pose> = {
  hero: { x: 0.4, y: 0.1, s: 0.52, yaw: -0.35, pitch: 0.12, roll: 0.08 },
  studio: { x: -0.72, y: -0.55, s: 0.28, yaw: 0.5, pitch: -0.2, roll: -0.1 },
  dash: { x: 0.64, y: -0.55, s: 0.34, yaw: -0.4, pitch: 0.22, roll: 0.1 },
  how: { x: 0.62, y: -0.7, s: 0.32, yaw: 0.55, pitch: -0.1, roll: 0.08 },
  roles: { x: -0.55, y: -0.5, s: 0.38, yaw: 0.9, pitch: 0.12, roll: -0.06 },
  under: { x: -0.76, y: 0.5, s: 0.24, yaw: 0.35, pitch: -0.15, roll: 0.05 },
  end: { x: -0.66, y: 0.5, s: 0.3, yaw: 0.3, pitch: -0.14, roll: 0.05 },
};

type PhonePose = Pick<Pose, "x" | "y" | "s">;

export const PHONE_POSES: Record<PoseKey, PhonePose> = {
  hero: { x: 0.12, y: 0.38, s: 0.34 },
  studio: { x: 0.42, y: -0.72, s: 0.2 },
  dash: { x: -0.35, y: -0.74, s: 0.2 },
  how: { x: 0.38, y: -0.74, s: 0.2 },
  roles: { x: -0.3, y: -0.76, s: 0.22 },
  under: { x: 0.4, y: -0.76, s: 0.2 },
  end: { x: 0.3, y: -0.74, s: 0.22 },
};

export type Anchor = { key: PoseKey; at: number };

const pageTop = (id: string) => {
  const element = document.getElementById(id);
  return element ? element.getBoundingClientRect().top + window.scrollY : null;
};

/** Scroll positions at which each pose applies. Recomputed on load and resize. */
export function resolveAnchors(): Anchor[] {
  const h = window.innerHeight;
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - h);
  const anchors: Anchor[] = [{ key: "hero", at: 0 }];

  const studio = pageTop("studio");
  if (studio !== null) anchors.push({ key: "studio", at: studio + 0.2 * h });

  const dash = document.getElementById("dash");
  if (dash) {
    const rect = dash.getBoundingClientRect();
    anchors.push({
      key: "dash",
      at: rect.top + window.scrollY + rect.height / 2 - 0.5 * h,
    });
  }

  const how = pageTop("how");
  if (how !== null) anchors.push({ key: "how", at: how + 0.3 * h });
  const roles = pageTop("roles");
  if (roles !== null) anchors.push({ key: "roles", at: roles + 0.3 * h });
  const under = pageTop("under");
  if (under !== null) anchors.push({ key: "under", at: under + 0.3 * h });
  const end = pageTop("end");
  if (end !== null) anchors.push({ key: "end", at: Math.min(end, maxScroll) });

  // Keep the list monotonic so interpolation never runs backwards.
  const result: Anchor[] = [];
  for (const anchor of anchors) {
    const previous = result[result.length - 1];
    result.push(
      previous && anchor.at <= previous.at
        ? { ...anchor, at: previous.at + 1 }
        : anchor,
    );
  }
  return result;
}

export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function poseFor(key: PoseKey, phone: boolean): Pose {
  return phone
    ? { ...DESKTOP_POSES[key], ...PHONE_POSES[key] }
    : DESKTOP_POSES[key];
}

export function poseAt(
  anchors: Anchor[],
  scrollY: number,
  phone: boolean,
): Pose {
  const first = anchors[0];
  const last = anchors[anchors.length - 1];
  if (scrollY <= first.at) return poseFor(first.key, phone);
  if (scrollY >= last.at) return poseFor(last.key, phone);
  for (let index = 0; index < anchors.length - 1; index += 1) {
    const from = anchors[index];
    const to = anchors[index + 1];
    if (scrollY >= from.at && scrollY <= to.at) {
      const t = easeInOutCubic((scrollY - from.at) / (to.at - from.at));
      const a = poseFor(from.key, phone);
      const b = poseFor(to.key, phone);
      return {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        s: a.s + (b.s - a.s) * t,
        yaw: a.yaw + (b.yaw - a.yaw) * t,
        pitch: a.pitch + (b.pitch - a.pitch) * t,
        roll: a.roll + (b.roll - a.roll) * t,
      };
    }
  }
  return poseFor(last.key, phone);
}
