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

export const toForwardDirection = (m: Matrix4) => {
  return new Vector3(
    m.elements[8],
    m.elements[9],
    m.elements[10],
  ).normalize();
};

export const toRotationMatrix = (transformation: Matrix4) => {
  return transformation.clone().setPosition(0, 0, 0);
};

export const toPosition = (m: Matrix4) => {
  return new Vector3(m.elements[12], m.elements[13], m.elements[14]);
};

export const parallelTransportTransformation = (
  transformation: Matrix4,
  nextPosition: Vector3,
) => {
  const position = toPosition(transformation);
  const direction = position.clone().sub(nextPosition).normalize();

  const rotationMatrix = toRotationMatrix(transformation);
  const localRotation = new Matrix4().copy(rotationMatrix).invert();

  const relativeDirection = direction
    .clone()
    .applyMatrix4(localRotation);

  const relativeDirectionLength = new Vector2(
    relativeDirection.x,
    relativeDirection.z,
  ).length();

  const rotationY = new Matrix4().makeRotationY(
    Math.atan2(-relativeDirection.x, -relativeDirection.z),
  );
  const rotationX = new Matrix4().makeRotationX(
    Math.atan2(relativeDirection.y, relativeDirectionLength),
  );

  rotationMatrix.multiply(rotationY);
  rotationMatrix.multiply(rotationX);

  return rotationMatrix.setPosition(position);
};

export const rollDirection = (m: Matrix4) => {
  const forward = toForwardDirection(m);
  const left = toLeftDirection(m);

  return left
    .sub(forward.clone().multiplyScalar(left.dot(forward)))
    .normalize();
};

export const toRollAngle = (m: Matrix4) =>
  Math.atan2(m.elements[1], m.elements[5]);

export const applyRoll = (m: Matrix4, roll: number) => {
  m.multiply(new Matrix4().makeRotationZ(roll));
  return m;
};
