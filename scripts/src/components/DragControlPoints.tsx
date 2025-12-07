import React from 'react';
import set from 'lodash/set';
import { Vector3 } from 'three';

import { ControlPoint } from './ControlPoint';
import { DragControlPosition } from './DragControlPosition';

export const DragControlPoints = (props: {
  points: Vector3[];
  setPoints: (points: Vector3[]) => void;
}) => {
  const { points, setPoints } = props;

  return (
    <>
      {points.map((point, index) => (
        <DragControlPosition
          position={point}
          onDrag={(position) => setPoints(set([...points], index, position))}
        >
          <ControlPoint />
        </DragControlPosition>
      ))}
    </>
  );
};
