import { Vector3 } from 'three';

export const length = (cp1: Vector3, cp2: Vector3) => cp1.distanceTo(cp2);

export const getPositionAtDistance = (cp1: Vector3, cp2: Vector3, distance: number) => {
  return cp1.clone().lerp(cp2, distance / length(cp1, cp2));
};

export const getForwardDirectionAtDistance = (cp1: Vector3, cp2: Vector3, distance : number) => {
  return cp2.clone().sub(cp1).normalize();
};
