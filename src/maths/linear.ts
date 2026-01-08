import { Matrix4, Vector3 } from 'three';

export const totalArcLength = (cp1: Vector3, cp2: Vector3) =>
  cp1.distanceTo(cp2);

export const positionAtArcLength = (
  cp1: Vector3,
  cp2: Vector3,
  at: number,
) => {
  return cp1.clone().lerp(cp2, at / totalArcLength(cp1, cp2));
};

export const forwardDirectionAtArcLength = (
  cp1: Vector3,
  cp2: Vector3,
  at: number,
) => {
  return cp2.clone().sub(cp1).normalize();
};

export const matrixAtArcLength = (
  cp1: Vector3,
  cp2: Vector3,
  at: number,
) => {
  const position = cp1
    .clone()
    .lerp(cp2, at / totalArcLength(cp1, cp2));

  return new Matrix4()
    .lookAt(cp2, cp1, new Vector3(0, 1, 0))
    .setPosition(position);
};
