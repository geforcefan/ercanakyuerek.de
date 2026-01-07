import { Vector4 } from 'three';

import { applyRollCurve, arcLengthAtOffset } from '../maths/curve';

import { fromRollPoints } from '../coaster/cubic-roll';
import { fromVertices } from '../coaster/nurbs-track';
import { readCustomTrack } from './nl2park/track/custom-track';
import { isRollPoint } from './nl2park/track/roll';
import { splitPointsByStrict } from './strict-point';

export const curveFromCustomTrack = (
  track: ReturnType<typeof readCustomTrack>,
  withRoll: boolean = true,
  resolution: number = 20,
) => {
  const curve = fromVertices(
    track.vertices.map((v) => ({
      ...v,
      position: new Vector4().fromArray(v.position),
    })),
    resolution,
  );

  if (withRoll)
    applyRollCurve(
      curve,
      fromRollPoints(curve, rollPointsFromCustomTrack(track)),
    );

  return curve;
};

export const rollPointsFromCustomTrack = (
  track: ReturnType<typeof readCustomTrack>,
) => {
  if (track.vertices.length < 2) return [];

  const sections = splitPointsByStrict(track.vertices);

  const parameterSpace: number[] = [0];
  for (const vertices of sections) {
    const lastParameterSpace =
      parameterSpace[parameterSpace.length - 1];

    parameterSpace.push(
      ...makeParameterSpaceMap(vertices.length)
        .slice(1)
        .map((u) => lastParameterSpace + u),
    );
  }

  return track?.points
    .filter(isRollPoint)
    .sort((a, b) => a.position - b.position)
    .map((point) => ({
      ...point,
      position: arcLengthAtOffset(point.position, parameterSpace),
    }));
};

export const makeParameterSpaceMap = (numberOfPoints: number) => {
  const space: number[] = [0];
  const push = (u: number, repeat: number) => {
    for (let i = 0; i < repeat; i++)
      space.push(space[space.length - 1] + u);
  };

  const hasMiddle = !(numberOfPoints <= 4);
  const numberOfSplits = hasMiddle ? 2 : numberOfPoints - 1;

  push(1 / numberOfSplits, numberOfSplits);

  if (hasMiddle) {
    push(1, numberOfPoints - 5);
    push(1 / numberOfSplits, numberOfSplits);
  }

  return space;
};
