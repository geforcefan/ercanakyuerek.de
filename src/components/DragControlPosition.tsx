import React, { useMemo } from 'react';
import { DragControls } from '@react-three/drei';
import { DragControlsProps } from '@react-three/drei/web/DragControls';
import { Matrix4, Vector3 } from 'three';

export const DragControlPosition = (
  props: {
    position?: Vector3;
    onDrag: (vec: Vector3) => void;
  } & Omit<DragControlsProps, 'onDrag'>,
) => {
  const {
    position = new Vector3(0, 0, 0),
    onDrag = () => {},
    children,
    ...rest
  } = props;

  const startMatrix = useMemo(() => {
    return new Matrix4().setPosition(position);
  }, [position]);

  return (
    <DragControls
      matrix={startMatrix}
      onDrag={(localMatrix) => {
        onDrag(new Vector3().setFromMatrixPosition(localMatrix));
      }}
      {...rest}
    >
      {children}
    </DragControls>
  );
};
