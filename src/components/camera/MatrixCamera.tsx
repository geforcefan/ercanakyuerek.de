import React, { useMemo } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import { PerspectiveCameraProps } from '@react-three/drei/core/PerspectiveCamera';
import { MathUtils, Matrix4, Vector3 } from 'three';

export const MatrixCamera = ({
  matrix = new Matrix4(),
  translate = new Vector3(),
  fov = 100,
  ...props
}: { translate?: Vector3; matrix: Matrix4 } & Omit<
  PerspectiveCameraProps,
  'matrixAutoUpdate' | 'matrix'
>) => {
  const perspectiveMatrix = useMemo(
    () =>
      matrix
        .clone()
        .multiply(
          new Matrix4().makeRotationY(MathUtils.degToRad(180)),
        )
        .multiply(
          new Matrix4().makeTranslation(translate.x, translate.y, translate.z)
        ),
    [matrix, translate.x, translate.y, translate.z],
  );

  return (
    <PerspectiveCamera
      matrixAutoUpdate={false}
      matrix={perspectiveMatrix}
      fov={fov}
      {...props}
    />
  );
};
