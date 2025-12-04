import React, { useMemo } from 'react';
import { BufferGeometry, Vector3 } from 'three';

const Line = (props: { points: Vector3[]; color?: number }) => {
  const { points, color } = props;
  const geometry = useMemo(() => {
    return new BufferGeometry().setFromPoints(points);
  }, [points]);

  return (
    // todo(ercan.akyuerek): solve this problem, get rid of ts-ignore
    // @ts-ignore
    <line geometry={geometry}>
      <lineBasicMaterial attach="material" color={color} />
    </line>
  );
};

export default Line;
