import React, { memo, useState } from 'react';
import set from 'lodash/set';
import { Vector3 } from 'three';

import { useColors } from '../hooks/useColors';

import { ControlPoint } from './ControlPoint';
import { DragControlPosition } from './DragControlPosition';
import { DragControlsProps } from '@react-three/drei/web/DragControls';

export const DragControlPoints = memo(
  (props: {
    points: Vector3[];
    setPoints: (points: Vector3[]) => void;
  } & Omit<DragControlsProps, "onDrag" | "children">) => {
    const { points, setPoints, ...rest } = props;

    const colors = useColors();
    const [hover, setHover] = useState<number>();

    return (
      <>
        {points.map((point, index) => (
          <DragControlPosition
            key={index}
            position={point}
            onDrag={(position) =>
              setPoints(set([...points], index, position))
            }
            {...rest}
          >
            <ControlPoint
              color={
                index === hover ? colors.highlight : colors.secondary
              }
              onPointerEnter={() => setHover(index)}
              onPointerLeave={() => setHover(undefined)}
            />
          </DragControlPosition>
        ))}
      </>
    );
  },
);
