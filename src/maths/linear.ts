import { Matrix4, Vector3 } from 'three';

export const length = (cp1: Vector3, cp2: Vector3) =>
  cp1.distanceTo(cp2);

export const positionAtDistance = (
  cp1: Vector3,
  cp2: Vector3,
  distance: number,
) => {
  return cp1.clone().lerp(cp2, distance / length(cp1, cp2));
};

export const forwardDirectionAtDistance = (
  cp1: Vector3,
  cp2: Vector3,
  distance: number,
) => {
  return cp2.clone().sub(cp1).normalize();
};

export const matrixAtDistance = (
  cp1: Vector3,
  cp2: Vector3,
  distance: number,
) => {
  const position = cp1.clone().lerp(cp2, distance / length(cp1, cp2));

  return new Matrix4()
    .lookAt(cp2, cp1, new Vector3(0, 1, 0))
    .setPosition(position);
};
