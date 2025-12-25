import { Matrix4, Vector3, Vector4 } from 'three';

export const fromMatrix4 = (matrix: Matrix4) =>
  new Vector3().setFromMatrixPosition(matrix);

export const fromVector4 = (v: Vector4) => new Vector3(v.x, v.y, v.z);
