export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function smoothstep01(value) {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

export function solveUndistortedRadius(distortedRadius, strength) {
  if (distortedRadius < 0.00001) return 0;

  let radius = distortedRadius;

  // Newton-Raphson inversion of:
  // distortedRadius = radius * (1 + strength * radius^2)
  for (let i = 0; i < 8; i += 1) {
    const radiusSquared = radius * radius;
    const value = radius * (1 + strength * radiusSquared) - distortedRadius;
    const derivative = 1 + 3 * strength * radiusSquared;

    radius -= value / derivative;
  }

  return Math.max(0, radius);
}
