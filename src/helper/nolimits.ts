import { applyRollCurve, arcLengthAtOffset } from '../maths/curve';

import { fromRollPoints } from '../coaster/cubic-roll';
import { fromVertices } from '../coaster/nurbs-track';
import { readCustomTrack } from './nl2park/track/custom-track';
import { isRollPoint } from './nl2park/track/roll-point';
import { splitPointsByStrict } from './strict-point';

export const curveFromCustomTrack = (
  track: ReturnType<typeof readCustomTrack>,
  withRoll: boolean = true,
  resolution: number = 20,
) => {
  const curve = fromVertices(
    track.vertices.map((vertex) => ({
      ...vertex,
      position: vertex.position.clone(),
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
  for (let i = 0; i < sections.length; i += 1) {
    const vertices = sections[i];
    const lastParameterSpace =
      parameterSpace[parameterSpace.length - 1];

    parameterSpace.push(
      ...makeParameterSpaceMap(vertices.length, track.closed)
        .slice(1)
        .map((u) => lastParameterSpace + u),
    );
  }

  const rollPoints = [
    {
      position: 0,
      roll: track.startRoll.roll,
      vertical: track.startRoll.vertical,
      strict: false,
    },
    {
      position: track.vertices.length - 1,
      roll: track.endRoll.roll,
      vertical: track.endRoll.vertical,
      strict: false,
    },
    ...track?.points.filter(isRollPoint),
  ];

  return rollPoints
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

  const hasMiddle = numberOfPoints > degree + 1;
  const splits = hasMiddle ? Math.min(2, degree) : numberOfPoints - 1;
  //const middle = numberOfPoints - splits - 1;

  if (closed) {
    /*if ((isFirstSection || isLastSection) && numberOfPoints <= 3) {
      push(1, 1) }
    else if (isFirstSection && numberOfPoints <= 3) {
      push(0.5, 4);
    } else if (isFirstSection && numberOfPoints <= 4) {
      push(1, 1);
      push(1 / 2, 2);
    } else if (isLastSection && numberOfPoints <= 4) {
      push(1 / 2, 2);
      push(1, 2);
    } else if (isFirstSection) {
      push(1, middle);
      push(1 / splits, splits);
    } else if (isLastSection) {
      push(1 / splits, splits);
      push(1, middle);
    } else */ push(1, numberOfPoints);
  } else {
    push(1 / splits, splits);
    if (hasMiddle) {
      push(1, numberOfPoints - 1 - 2 * splits);
      push(1 / splits, splits);
    }
  }

  return space;
};
