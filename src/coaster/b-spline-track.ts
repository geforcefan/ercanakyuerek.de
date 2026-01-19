import { Vector4 } from 'three';

import { fromPoints } from '../maths/b-spline';

export const fromVertices = (
  vertices: Array<{ position: Vector4; strict: boolean }>,
  closed: boolean = false,
  resolution: number = 20,
) => {
  const points: Vector4[] = [];

  for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i];
    const clamp = !closed && (i === vertices.length - 1 || !i);

    points.push(vertex.position);

    if (clamp || vertex.strict)
      points.push(vertex.position, vertex.position);
  }

  if (closed && points.length >= 4) {
    points.unshift(points[points.length - 1]);
    points.push(points[1]);
    points.push(points[2]);
  }

  return fromPoints(points, resolution);
};
