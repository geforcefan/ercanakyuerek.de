import { Matrix4, Quaternion, Vector2, Vector3 } from 'three';

import { fromMatrix4 } from './vector3';
import { fromVector3 } from './vector4';

export const interpolate = (matrixA: Matrix4, matrixB: Matrix4, t: number) => {
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
  return fromMatrix4(from).distanceTo(fromMatrix4(to));
};

export const lookRelativeAt = (matrix: Matrix4, lookAt: Vector3) => {
  const translation = new Vector3().setFromMatrixPosition(matrix);
  const normal = fromVector3(translation.clone().sub(lookAt).normalize(), 1.0);

  matrix.setPosition(0, 0, 0);

  const inverseMatrix = new Matrix4().copy(matrix).invert();
  const transformedNormal = normal.clone().applyMatrix4(inverseMatrix);

  const normalLength = new Vector2(transformedNormal.x, transformedNormal.z).length();

  const rotationY = new Matrix4().makeRotationY(
    Math.atan2(-transformedNormal.x, -transformedNormal.z),
  );
  const rotationX = new Matrix4().makeRotationX(Math.atan2(transformedNormal.y, normalLength));

  matrix.multiply(rotationY);
  matrix.multiply(rotationX);

  matrix.setPosition(translation);

  return matrix;
};

export const getRoll = (m: Matrix4) => Math.atan2(m.elements[1], m.elements[5]);
