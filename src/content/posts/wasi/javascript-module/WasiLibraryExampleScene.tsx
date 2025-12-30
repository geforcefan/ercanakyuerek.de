import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { Vector3 } from 'three';

import { uniformSampleMap } from '../../../../helper/uniform-sample';
import { useColors } from '../../../../hooks/useColors';

import { DragControlPoints } from '../../../../components/DragControlPoints';
import { OrthographicScene } from '../../../../scenes/OrthographicScene';

import {
  bezierFromPoints,
  bezierLength,
  bezierPositionAtDistance,
} from '../../../../libs/calculation';

export const WasiLibraryExampleScene = () => {
  const colors = useColors();

  const [points, setPoints] = React.useState([
    new Vector3(-3, -3, 0),
    new Vector3(3, -3, 0),
    new Vector3(-3, 3, 0),
    new Vector3(3, 3, 0),
  ]);

  const nodes = useMemo(() => {
    const bezier = bezierFromPoints(
      points[0].toArray(),
      points[1].toArray(),
      points[2].toArray(),
      points[3].toArray(),
    );

    return uniformSampleMap(0, bezierLength(bezier), 5, (at) =>
      new Vector3().fromArray(bezierPositionAtDistance(bezier, at)),
    );
  }, [points]);

  return (
    <OrthographicScene>
      <DragControlPoints points={points} setPoints={setPoints} />
      <Line color={colors.highlight} points={points} segments={true} />
      <Line color={colors.secondary} points={nodes} />
    </OrthographicScene>
  );
};
