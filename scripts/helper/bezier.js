import { Vector3 } from "three";
import lowerBound from "./lower-bound";

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

export const length = (nodes) => {
  if (!nodes.length) return 0;
  return nodes[nodes.length - 1].distance;
};

export const getPositionAtDistance = (nodes, at) => {
  if (nodes.length < 2) return new Vector3(0.0);

  const lowerElement = lowerBound(nodes, at, "distance");

  const nextNode = nodes[lowerElement];
  const currentNode = nodes[lowerElement - 1];

  const isFirst = nextNode === nodes[0];
  const isLast = currentNode === nodes[nodes.length - 1];

  if (isFirst) return nodes[0].position;
  if (isLast) return nodes[nodes.length - 1].position;

  let t = 0.0;

  if (nextNode.dist - currentNode.dist > 0.0001) {
    t = Math.max(
      Math.min(
        (at - currentNode.dist) / (nextNode.dist - currentNode.dist),
        1.0
      ),
      0.0
    );
  }

  return currentNode.position.lerp(nextNode.position, t);
};
export const evaluateUniform = (p0, p1, p2, p3, resolution = 10) => {
  const newNodes = [];
  const nodes = evaluate(p0, p1, p2, p3, 40);
  const splineLength = length(nodes);

  const numberOfNodes = Math.max(Math.floor(splineLength * resolution), 2);
  for (let i = 0; i < numberOfNodes; i++) {
    const at = (i / (numberOfNodes - 1)) * splineLength;
    const position = getPositionAtDistance(nodes, at);

    newNodes.push({
      position,
      distance: at,
    });
  }

  return newNodes;
};

export const evaluate = (p0, p1, p2, p3, resolution = 10) => {
  let distance = 0;
  const nodes = [];
  const numberOfNodes = Math.max(
    Math.floor(estimateLength(p0, p1, p2, p3) * resolution),
    2
  );
  let lastPosition = p0;

  for (let i = 0; i < numberOfNodes; i++) {
    const t = i / (numberOfNodes - 1);

    const position = bezierFast(p0, p1, p2, p3, t);
    distance += position.distanceTo(lastPosition);

    nodes.push({
      position,
      distance,
    });

    lastPosition = position;
  }

  return nodes;
};
