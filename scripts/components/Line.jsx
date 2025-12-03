import React, { useMemo } from 'react';
import { BufferGeometry } from 'three';

const Line = ({ points, color = null }) => {
  const geometry = useMemo(() => {
    return new BufferGeometry().setFromPoints(points);
  }, [points]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial attach="material" color={color} />
    </line>
  );
};

export default Line;
