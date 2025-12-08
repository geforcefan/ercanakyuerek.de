import { Matrix4, Vector3 } from 'three';

export const fromMatrix4 = (matrix: Matrix4) => new Vector3().setFromMatrixPosition(matrix);
