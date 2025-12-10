import { Vector2 } from 'three';

import { lowerBound } from './lower-bound';

export interface CubicSpline {
  x: number[];
  y: number[];
  b: number[];
  c: number[];
  d: number[];
}

export function makeCubicSpline(points: Vector2[]): CubicSpline {
  const n = points.length - 1;

  const x = points.map((p) => p.x);
  const y = points.map((p) => p.y);

  const h = Array.from({ length: n }, (_, i) => x[i + 1] - x[i]);
  const alpha = Array(n + 1).fill(0);

  for (let i = 1; i < n; i++) {
    const sR = (y[i + 1] - y[i]) / h[i];
    const sL = (y[i] - y[i - 1]) / h[i - 1];
    alpha[i] = 3 * (sR - sL);
  }

  // solve tridiagonal system
  const c = Array(n + 1).fill(0);
  const d = [...c];
  const b = Array(n).fill(0);

  const l = Array(n + 1).fill(0);
  const mu = Array(n + 1).fill(0);
  const z = Array(n + 1).fill(0);

  l[0] = 1;

  for (let i = 1; i < n; i++) {
    l[i] = 2 * (x[i + 1] - x[i - 1]) - h[i - 1] * mu[i - 1];
    mu[i] = h[i] / l[i];
    z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i];
  }

  l[n] = 1;

  // Back substitution
  for (let i = n - 1; i >= 0; i--) {
    c[i] = z[i] - mu[i] * c[i + 1];
    b[i] = (y[i + 1] - y[i]) / h[i] - (h[i] * (2 * c[i] + c[i + 1])) / 3;
    d[i] = (c[i + 1] - c[i]) / (3 * h[i]);
  }

  return { x, y, b, c, d };
}

export function evaluateSpline(s: CubicSpline, t: number): number {
  const j = lowerBound(s.x, t, (v) => v);
  const i = Math.max(0, j - 1);
  const dx = t - s.x[i];

  return s.y[i] + s.b[i] * dx + s.c[i] * dx * dx + s.d[i] * dx * dx * dx;
}
