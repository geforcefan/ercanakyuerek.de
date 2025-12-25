import React, { useMemo } from 'react';
import { Vector3 } from 'three';

import { uniformMap } from '../../../../helper/uniform-map';
import { useColors } from '../../../../hooks/useColors';

import { DragControlPoints } from '../../../../components/DragControlPoints';
import { Line } from '../../../../components/Line';
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

    return uniformMap(0, bezierLength(bezier), 5, (at) =>
      new Vector3().fromArray(bezierPositionAtDistance(bezier, at)),
    );
  }, [points]);

  return (
    <OrthographicScene>
      <DragControlPoints points={points} setPoints={setPoints} />
      <Line color={colors.secondary} points={points} />
      <Line color={colors.secondary} points={nodes} />
    </OrthographicScene>
  );
};
