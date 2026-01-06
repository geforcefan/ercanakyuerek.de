import React, { useMemo } from 'react';
import { BufferGeometry, Vector3, Vector4 } from 'three';

import {
  CurveNode,
  matrixAtArcLength,
  totalArcLength,
} from '../../maths/curve';
import { useColors } from '../../hooks/useColors';

const wireFrameParts = [
  new Vector4(1, 0, 0, 1),
  new Vector4(0, -1, 0, 1),
  new Vector4(-1, 0, 0, 1),
];
export const CurveWireframe = ({
  railSpacing = 0.25,
  tieSpacing = 1,
  loopTie = true,
  tieParts = wireFrameParts,
  railParts = wireFrameParts,
  curve = [],
  offset = new Vector4(0, 0, 0, 0),
  color,
}: {
  curve: CurveNode[];
  railSpacing?: number;
  tieSpacing?: number;
  tieParts?: Vector4[];
  railParts?: Vector4[];
  loopTie?: boolean;
  color?: number;
  offset?: Vector4;
}) => {
  const colors = useColors();

  const tie = useMemo(() => tieParts.map(p => p.clone().add(offset)), [offset, tieParts]);
  const rails = useMemo(() => railParts.map(p => p.clone().add(offset)), [offset, railParts]);

  const points = useMemo(() => {
    const curveLength = totalArcLength(curve);
    const numNodes = Math.floor(curveLength / railSpacing);

    const points: Vector3[] = [];
    let tieDistance = 0;

    for (let k = 0; k < numNodes - 1; k++) {
      const currentArcLength: number =
        (k / (numNodes - 1)) * curveLength;
      const currentMatrixAtArcLength = matrixAtArcLength(
        curve,
        currentArcLength,
      );

      const nextArcLength: number =
        ((k + 1) / (numNodes - 1)) * curveLength;
      const nextMatrixAtArcLength = matrixAtArcLength(
        curve,
        nextArcLength,
      );

      for (let k = 0; k < rails.length; k++) {
        const currentPos = rails[k]
          .clone()
          .applyMatrix4(currentMatrixAtArcLength);
        const nextPos = rails[k]
          .clone()
          .applyMatrix4(nextMatrixAtArcLength);

        points.push(
          new Vector3(currentPos.x, currentPos.y, currentPos.z),
        );
        points.push(new Vector3(nextPos.x, nextPos.y, nextPos.z));
      }

      if (tieDistance > tieSpacing) {
        for (
          let k = 0;
          k < (loopTie ? tie.length : tie.length - 1);
          k++
        ) {
          const currentPos = tie[k % tie.length]
            .clone()
            .applyMatrix4(currentMatrixAtArcLength);

          const nextPos = tie[(k + 1) % tie.length]
            .clone()
            .applyMatrix4(currentMatrixAtArcLength);

          points.push(
            new Vector3(currentPos.x, currentPos.y, currentPos.z),
          );
          points.push(new Vector3(nextPos.x, nextPos.y, nextPos.z));
        }

        tieDistance = 0;
      }

      tieDistance += nextArcLength - currentArcLength;
    }

    return points;
  }, [curve, loopTie, railSpacing, rails, tie, tieSpacing]);

  return (
    <lineSegments
      geometry={new BufferGeometry().setFromPoints(points)}
    >
      <lineBasicMaterial
        attach="material"
        color={color || colors.secondary}
      />
    </lineSegments>
  );
};
