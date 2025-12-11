import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Vector3, Vector4 } from 'three';

import { CurveNode, getLength, getMatrixAtDistance } from '../maths/curve';

const CurveWireframe = (props: {
  curve: CurveNode[],
  railSpacing?: number,
  tieSpacing?: number,
  rails?: Vector4[],
  tie?: Vector4[],
  loopTie?: boolean,
  color?: number;
}) => {
  const wireFrameParts = [
    new Vector4(1, 0, 0, 1),
    new Vector4(0, -1, 0, 1),
    new Vector4(-1, 0, 0, 1),
  ];

  const {
    railSpacing= 0.5,
    tieSpacing = 1,
    loopTie = true,
    tie= wireFrameParts,
    rails = wireFrameParts,
    curve = [],
    color = 0x0000ff,
  } = props;

  const points = useMemo(() => {

    const curveLength = getLength(curve);
    const numNodes = Math.floor(curveLength / railSpacing);

    const points: Vector3[] = [];
    let tieDist = 0;

    for (let k = 0; k < numNodes - 1; k++) {
      const currentDistance: number = (k / (numNodes - 1)) * curveLength;
      const currentMatrixAtDistance = getMatrixAtDistance(curve, currentDistance);

      const nextDistance: number = ((k + 1) / (numNodes - 1)) * curveLength;
      const nextMatrixAtDistance = getMatrixAtDistance(curve, nextDistance);

      for (let k = 0; k < rails.length; k++) {
        const currentPos = rails[k].clone().applyMatrix4(currentMatrixAtDistance);
        const nextPos = rails[k].clone().applyMatrix4(nextMatrixAtDistance);

        points.push(new Vector3(currentPos.x, currentPos.y, currentPos.z));
        points.push(new Vector3(nextPos.x, nextPos.y, nextPos.z));
      }

      if (tieDist > tieSpacing) {
        for (let k = 0; k < (loopTie ? tie.length : tie.length - 1); k++) {
          const currentPos = tie[k % tie.length].clone().applyMatrix4(currentMatrixAtDistance);

          const nextPos = tie[(k + 1) % tie.length].clone().applyMatrix4(currentMatrixAtDistance);

          points.push(new Vector3(currentPos.x, currentPos.y, currentPos.z));
          points.push(new Vector3(nextPos.x, nextPos.y, nextPos.z));
        }

        tieDist = 0;
      }

      tieDist += nextDistance - currentDistance;
    }

    return points;
  }, [curve, loopTie, railSpacing, rails, tie, tieSpacing]);

  return (
    <lineSegments geometry={new THREE.BufferGeometry().setFromPoints(points)}>
      <lineBasicMaterial attach="material" color={color} />
    </lineSegments>
  );
};

export default CurveWireframe;
