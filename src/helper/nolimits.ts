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
    track.vertices.map((vertex) => ({
      ...vertex,
      position: new Vector4().fromArray(vertex.position),
    })),
    track.closed,
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
      ...makeParameterSpaceMap(vertices.length, track.closed)
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

export const makeParameterSpaceMap = (
  numberOfPoints: number,
  closed: boolean = false,
) => {
  const space: number[] = [0];
  const degree = Math.min(numberOfPoints - 1, 3);

  const push = (u: number, repeat: number) => {
    for (let i = 0; i < repeat; i++)
      space.push(space[space.length - 1] + u);
  };

  if (closed) {
    push(1, numberOfPoints);
  } else {
    const hasMiddle = numberOfPoints > degree + 1;
    const splits = hasMiddle
      ? Math.min(2, degree)
      : numberOfPoints - 1;

    push(1 / splits, splits);
    if (hasMiddle) {
      push(1, numberOfPoints - 1 - 2 * splits);
      push(1 / splits, splits);
    }
  }

  return space;
};
