import React, { useMemo } from 'react';
import { DragControls } from '@react-three/drei';
import { Matrix4, Vector3 } from 'three';

export const DragControlPosition = ({
  axisLock = 'z',
  position,
  onDrag = (vec) => {},
  children,
}) => {
  const startMatrix = useMemo(() => {
    return new Matrix4().setPosition(position);
  }, [position]);

  return (
    <DragControls
      axisLock={axisLock}
      matrix={startMatrix}
      onDrag={(localMatrix) => {
        onDrag(new Vector3().setFromMatrixPosition(localMatrix));
      }}
    >
      {children}
    </DragControls>
  );
};
