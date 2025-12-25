import React from 'react';
import { ThreeElements } from '@react-three/fiber';
import { Vector3 } from 'three';

export const MatrixArrowHelper = (props: ThreeElements['group']) => {
  return (
    <group matrixAutoUpdate={false} {...props}>
      <arrowHelper
        args={[
          new Vector3(0, 1, 0),
          new Vector3(0, 0, 0),
          2,
          0x00dd00,
        ]}
      />
      <arrowHelper
        args={[
          new Vector3(1, 0, 0),
          new Vector3(0, 0, 0),
          2,
          0x0000dd,
        ]}
      />
      <arrowHelper
        args={[
          new Vector3(0, 0, 1),
          new Vector3(0, 0, 0),
          2,
          0xdd0000,
        ]}
      />
    </group>
  );
};
