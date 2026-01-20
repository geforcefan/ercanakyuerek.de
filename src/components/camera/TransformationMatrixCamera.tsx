import React from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import { PerspectiveCameraProps } from '@react-three/drei/core/PerspectiveCamera';
import { Matrix4, Vector3 } from 'three';

export const TransformationMatrixCamera = ({
  matrix = new Matrix4(),
  translate = new Vector3(),
  fov = 100,
  ...props
}: { translate?: Vector3; matrix: Matrix4 } & Omit<
  PerspectiveCameraProps,
  'matrixAutoUpdate' | 'matrix'
>) => {
  return (
    <group matrix={matrix} matrixAutoUpdate={false}>
      <group position={translate} rotation={[0, Math.PI, 0]}>
        <PerspectiveCamera fov={fov} {...props} />
      </group>
    </group>
  );
};
