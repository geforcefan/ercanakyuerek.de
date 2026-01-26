import { Vector2 } from 'three';

export const makeCircleShape = (
  radius: number,
  segments: number,
  offset: Vector2 = new Vector2(0, 0),
): Vector2[] => {
  const points: Vector2[] = [];

  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    points.push(
      new Vector2(
        Math.cos(t) * radius + offset.x,
        Math.sin(t) * radius + offset.y,
      ),
    );
  }

  return points;
};
