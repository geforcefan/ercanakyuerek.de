import { Vector2, Vector3 } from 'three';

import { lowerBound } from '../helper/binary-search';

import { emptyCurve, fromUniformSampledPositions } from './curve';

export function clampedCubicSpline(
  points: Vector2[],
  startSlope: number = 0,
  endSlope: number = 0,
) {
  const n = points.length - 1;

  const x = points.map((p) => p.x);
  const y = points.map((p) => p.y);
  const dx = Array.from({ length: n }, (_, i) => x[i + 1] - x[i]);

  const alpha = Array(n + 1).fill(0);

  // clamped
  alpha[0] = 3 * ((y[1] - y[0]) / dx[0] + startSlope);
  alpha[n] = 3 * (endSlope - (y[n] - y[n - 1]) / dx[n - 1]);

  for (let i = 1; i < n; i++) {
    const sR = (y[i + 1] - y[i]) / dx[i];
    const sL = (y[i] - y[i - 1]) / dx[i - 1];
    alpha[i] = 3 * (sR - sL);
  }

  // solve tridiagonal system
  const c = Array(n + 1).fill(0);
  const b = Array(n + 1).fill(0);
  const d = Array(n + 1).fill(0);

  const l = Array(n + 1).fill(0);
  const mu = Array(n + 1).fill(0);
  const z = Array(n + 1).fill(0);

  // start
  l[0] = 2 * dx[0];
  mu[0] = 0.5;
  z[0] = alpha[0] / l[0];

  // inner
  for (let i = 1; i < n; i++) {
    l[i] = 2 * (x[i + 1] - x[i - 1]) - dx[i - 1] * mu[i - 1];
    mu[i] = dx[i] / l[i];
    z[i] = (alpha[i] - dx[i - 1] * z[i - 1]) / l[i];
  }

  // end
  l[n] = dx[n - 1] * (2 - mu[n - 1]);
  z[n] = (alpha[n] - dx[n - 1] * z[n - 1]) / l[n];
  c[n] = z[n];

  // back substitution
  for (let j = n - 1; j >= 0; j--) {
    c[j] = z[j] - mu[j] * c[j + 1];
    b[j] =
      (y[j + 1] - y[j]) / dx[j] - (dx[j] * (c[j + 1] + 2 * c[j])) / 3;
    d[j] = (c[j + 1] - c[j]) / (3 * dx[j]);
  }

  return { x, y, b, c, d };
}

const evaluate = (
  s: ReturnType<typeof clampedCubicSpline>,
  t: number,
) => {
  const j = lowerBound(s.x, t, (v) => v);
  const i = Math.max(0, j - 1);
  const dx = t - s.x[i];

  return (
    s.y[i] + s.b[i] * dx + s.c[i] * dx * dx + s.d[i] * dx * dx * dx
  );
};

export const clampedCubicSplineCurve = (
  points: Vector2[],
  startSlope: number = 0,
  endSlope: number = 0,
  resolution: number = 8,
) => {
  if (points.length < 2) return emptyCurve();

  const spline = clampedCubicSpline(points, startSlope, endSlope);

  return fromUniformSampledPositions(
    points[0].x,
    points[points.length - 1].x,
    resolution,
    (at) => new Vector3(at, evaluate(spline, at), 0),
  );
};
