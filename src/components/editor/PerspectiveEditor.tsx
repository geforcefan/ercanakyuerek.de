import React, { useState } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

import { PerspectiveCameraControls } from '../camera/PerspectiveCameraControls';

export const PerspectiveEditor = () => {
  const [camera, setCamera] =
    useState<THREE.PerspectiveCamera | null>();
  return (
    <>
      <PerspectiveCamera
        ref={setCamera}
        makeDefault={true}
        position={[10, 5, 10]}
      />
      {camera && <PerspectiveCameraControls camera={camera} />}
    </>
  );
};
