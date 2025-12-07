import { Matrix4 } from 'three';

export type CurveNode = {
  matrix: Matrix4;
  distance: number;
};

const getMatrixAtDistance = (curve: CurveNode[], distance: number) => {
  // placeholder
  return new Matrix4();
};
