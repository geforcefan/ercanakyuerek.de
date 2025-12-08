import React from 'react';
import { Matrix4, Vector3 } from 'three';

const MatrixArrowHelper = (props: { matrix: Matrix4 }) => {
  const { matrix } = props;
  return (
    <group matrixAutoUpdate={false} matrix={matrix}>
      <arrowHelper args={[new Vector3(0, 1, 0), new Vector3(0, 0, 0), 2, 0x00dd00]} />
      <arrowHelper args={[new Vector3(1, 0, 0), new Vector3(0, 0, 0), 2, 0x0000dd]} />
      <arrowHelper args={[new Vector3(0, 0, 1), new Vector3(0, 0, 0), 2, 0xdd0000]} />
    </group>
  );
};

export default MatrixArrowHelper;
