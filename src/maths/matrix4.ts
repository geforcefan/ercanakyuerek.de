import { Matrix4, Quaternion, Vector2, Vector3 } from 'three';

export const lerp = (
  matrixA: Matrix4,
  matrixB: Matrix4,
  t: number,
) => {
  const fromQuaternion = new Quaternion();
  const toQuaternion = new Quaternion();

  const fromPosition = new Vector3();
  const toPosition = new Vector3();

  const scale = new Vector3();

  matrixA.decompose(fromPosition, fromQuaternion, scale);
  matrixB.decompose(toPosition, toQuaternion, scale);

  return new Matrix4().compose(
    fromPosition.clone().lerp(toPosition, t),
    fromQuaternion.slerp(toQuaternion, t),
    scale,
  );
};

export const distance = (from: Matrix4, to: Matrix4) => {
  return toPosition(from).distanceTo(toPosition(to));
};

export const toUpDirection = (m: Matrix4) => {
  return new Vector3(
    m.elements[4],
    m.elements[5],
    m.elements[6],
  ).normalize();
};

export const toLeftDirection = (m: Matrix4) => {
  return new Vector3(
    m.elements[0],
    m.elements[1],
    m.elements[2],
  ).normalize();
};

export const toFrontDirection = (m: Matrix4) => {
  return new Vector3(
    m.elements[8],
    m.elements[9],
    m.elements[10],
  ).normalize();
};

export const toPosition = (m: Matrix4) => {
  return new Vector3(m.elements[12], m.elements[13], m.elements[14]);
};

export const applyLookRelativeAt = (
  matrix: Matrix4,
  lookAt: Vector3,
) => {
  const position = toPosition(matrix);
  const normal = position.clone().sub(lookAt).normalize();

  matrix.setPosition(0, 0, 0);

  const inverseMatrix = new Matrix4().copy(matrix).invert();
  const transformedNormal = normal
    .clone()
    .applyMatrix4(inverseMatrix);

  const normalLength = new Vector2(
    transformedNormal.x,
    transformedNormal.z,
  ).length();

  const rotationY = new Matrix4().makeRotationY(
    Math.atan2(-transformedNormal.x, -transformedNormal.z),
  );
  const rotationX = new Matrix4().makeRotationX(
    Math.atan2(transformedNormal.y, normalLength),
  );

  matrix.multiply(rotationY);
  matrix.multiply(rotationX);

  matrix.setPosition(position);

  return matrix;
};

export const rollDirection = (m: Matrix4) => {
  const front = toFrontDirection(m);
  const left = toLeftDirection(m);

  return left
    .sub(front.clone().multiplyScalar(left.dot(front)))
    .normalize();
};

export const toRollAngle = (m: Matrix4) =>
  Math.atan2(m.elements[1], m.elements[5]);

export const applyRoll = (m: Matrix4, roll: number) => {
  m.multiply(new Matrix4().makeRotationZ(roll));
  return m;
};
