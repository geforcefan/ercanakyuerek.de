import { Vector3, Vector4 } from 'three';

export const fromVector3 = (vector: Vector3, w: number = 0) =>
  new Vector4(vector.x, vector.y, vector.z, w);
