import React, { ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer } from '@react-three/postprocessing';
import { ACESFilmicToneMapping, Vector3 } from 'three';
import { useDevicePixelRatio } from 'use-device-pixel-ratio';

import { useColors } from '../../hooks/useColors';

const sunPosition = new Vector3(50, 50, 0);

export const DefaultCanvas = ({
  children,
}: {
  children?: ReactNode;
}) => {
  const colors = useColors();
  const dpr = useDevicePixelRatio();

  return (
    <Canvas
      gl={{ toneMapping: ACESFilmicToneMapping }}
      dpr={dpr}
      shadows={true}
    >
      <ambientLight castShadow={true} intensity={1.3} />
      <directionalLight
        castShadow
        position={sunPosition}
        intensity={1}
        shadow-mapSize-width={2048 * 4}
        shadow-mapSize-height={2048 * 4}
        shadow-camera-near={1}
        shadow-camera-far={400}
        shadow-camera-left={-400}
        shadow-camera-right={400}
        shadow-camera-top={400}
        shadow-camera-bottom={-400}
      />

      <color attach="background" args={[colors.primary]} />

      <EffectComposer>
        <>{children}</>
      </EffectComposer>
    </Canvas>
  );
};
