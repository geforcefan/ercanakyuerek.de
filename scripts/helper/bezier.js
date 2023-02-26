import { Vector3 } from "three";

export const bezierFast = (p0, p1, p2, p3, t) => {
  const t1 = 1.0 - t;
  const b0 = t1 * t1 * t1;
  const b1 = 3 * t1 * t1 * t;
  const b2 = 3 * t1 * t * t;
  const b3 = t * t * t;

  return new Vector3(
    b0 * p0.x + b1 * p1.x + b2 * p2.x + b3 * p3.x,
    b0 * p0.y + b1 * p1.y + b2 * p2.y + b3 * p3.y,
    b0 * p0.z + b1 * p1.z + b2 * p2.z + b3 * p3.z
  );
};

export const estimateLength = (p0, p1, p2, p3) => {
  let lastPosition = p0;
  let length = 0.0;

  for (let i = 0; i < 15; i += 2) {
    const t = i / 14.0;
    const position = bezierFast(p0, p1, p2, p3, t);
    length += position.distanceTo(lastPosition);
    lastPosition = position;
  }

  return length;
};

export const evaluate = (p0, p1, p2, p3, resolution = 5) => {
  const nodes = [];
  const numberOfNodes = Math.max(
    Math.floor(estimateLength(p0, p1, p2, p3) * resolution),
    2
  );
  let lastPosition = p0;

  for (let i = 0; i < numberOfNodes; i++) {
    const t = i / (numberOfNodes - 1);

    const position = bezierFast(p0, p1, p2, p3, t);
    const distance = position.distanceTo(lastPosition);

    nodes.push({
      position,
      distance,
    });

    lastPosition = position;
  }

  return nodes;
};
