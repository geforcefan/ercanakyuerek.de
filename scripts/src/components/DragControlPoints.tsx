import React, { memo, useState } from 'react';
import set from 'lodash/set';
import { Vector3 } from 'three';

import useColors from '../hooks/useColors';
import { ControlPoint } from './ControlPoint';
import { DragControlPosition } from './DragControlPosition';

export const DragControlPoints = memo((props: {
  axisLock?: 'x' | 'y' | 'z';
  points: Vector3[];
  setPoints: (points: Vector3[]) => void;
}) => {
  const { points, setPoints, axisLock } = props;

  const colors = useColors();
  const [hover, setHover] = useState<number>();

  return (
    <>
      {points.map((point, index) => (
        <DragControlPosition
          key={index}
          axisLock={axisLock}
          position={point}
          onDrag={(position) => setPoints(set([...points], index, position))}
        >
          <ControlPoint
            color={index === hover ? colors.highlight : colors.secondary}
            onPointerEnter={() => setHover(index)}
            onPointerLeave={() => setHover(undefined)}
          />
        </DragControlPosition>
      ))}
    </>
  );
});
