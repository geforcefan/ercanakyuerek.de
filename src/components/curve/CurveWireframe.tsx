import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { LineProps } from '@react-three/drei/core/Line';
import { Vector3 } from 'three';

import {
  Curve,
  totalArcLength,
  transformationAtArcLength,
} from '../../maths/curve';
import { useColors } from '../../hooks/useColors';

const wireFrameParts = [
  new Vector3(1, 0, 0),
  new Vector3(0, -1, 0),
  new Vector3(-1, 0, 0),
];
export const CurveWireframe = ({
  railSpacing = 0.25,
  tieSpacing = 1,
  loopTie = true,
  tie = wireFrameParts,
  rails = wireFrameParts,
  curve,
  ...props
}: {
  curve: Curve;
  railSpacing?: number;
  tieSpacing?: number;
  tie?: Vector3[];
  rails?: Vector3[];
  loopTie?: boolean;
  offset?: Vector3;
} & Omit<LineProps, 'points'>) => {
  const colors = useColors();

  const points = useMemo(() => {
    const curveLength = totalArcLength(curve);
    const numNodes = Math.floor(curveLength / railSpacing);

    const points: Vector3[] = [];
    let tieDistance = 0;

    for (let k = 0; k < numNodes - 1; k++) {
      const currentArcLength: number =
        (k / (numNodes - 1)) * curveLength;
      const currentMatrixAtArcLength = transformationAtArcLength(
        curve,
        currentArcLength,
      );

      const nextArcLength: number =
        ((k + 1) / (numNodes - 1)) * curveLength;
      const nextMatrixAtArcLength = transformationAtArcLength(
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
    <Line
      points={points}
      segments={true}
      lineWidth={1}
      color={colors.secondary}
      {...props}
    />
  );
};
