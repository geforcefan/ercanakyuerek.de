import { Matrix4, Quaternion, Vector2, Vector3 } from 'three';

import { fromVector3 } from './vector4';
import { fromMatrix4 } from './vector3';

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

export const lookRelativeAt = (origin: Matrix4, lookAt: Vector3) => {
  const position = fromMatrix4(origin);
  const normal = fromVector3(position.clone().sub(lookAt).normalize(), 1.0);

  const inverseMatrix = origin.clone().setPosition(0, 0, 0).invert();
  const direction = normal.applyMatrix4(inverseMatrix);

  const yaw = new Matrix4().makeRotationY(Math.atan2(-direction.x, -direction.z));
  const pitch = new Matrix4().makeRotationX(
    Math.atan2(direction.y, new Vector2(direction.x, direction.z).length()),
  );

  const out = new Matrix4();
  out.multiply(yaw);
  out.multiply(pitch);

  return out;
};
