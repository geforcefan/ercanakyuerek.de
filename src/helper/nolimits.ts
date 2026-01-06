import { parse } from 'csv-parse/browser/esm';
import { uniq } from 'lodash';
import { MathUtils, Matrix4, Vector2, Vector3, Vector4 } from 'three';

import { clampedCubicSplineCurve } from '../maths/cubic';
import {
  applyRollFromCurve,
  arcLengthAtOffset,
  CurveNode,
  insertMatrix,
  matrixAtArcLength,
  toSegmentLengths,
  toSegmentOffsets,
} from '../maths/curve';
import { fromPoints, makeClampedKnots } from '../maths/nurbs';

import { readCustomTrack } from './nl2park/track/custom-track';
import { isRollPoint } from './nl2park/track/roll';

export const applyRollFromCustomTrack = (
  curve: CurveNode[],
  segmentOffsets: number[],
  customTrack: ReturnType<typeof readCustomTrack>,
) => {
  const rollPoints = customTrack?.points
    .filter(isRollPoint)
    .sort((a, b) => a.position - b.position);

  const rollSections = splitPointsByStrict(rollPoints);

  let lastRoll = 0;
  let offset = 0;

  const rollCurve: CurveNode[] = [];

  for (const sectionRollPoints of rollSections) {
    const cubicSplineCurve = clampedCubicSplineCurve(
      sectionRollPoints.map((p) => {
        const arcLength = arcLengthAtOffset(
          p.position,
          segmentOffsets,
        );
        const matrix = matrixAtArcLength(curve, arcLength);

        let roll = MathUtils.degToRad(p.roll);

        const up = new Vector4(0, 1, 0, 0)
          .applyMatrix4(matrix)
          .normalize();

        const left = new Vector4(1, 0, 0, 0)
          .applyMatrix4(matrix)
          .normalize();

        if (p.vertical) roll += Math.atan2(left.z, up.z);
        else roll += Math.atan2(left.y, up.y);

        const deltaRoll = roll - lastRoll;
        lastRoll = roll;

        if (Math.abs(deltaRoll) >= Math.PI) {
          if (deltaRoll > 0.0) offset -= Math.PI * 2;
          else offset += Math.PI * 2;
        }

        roll += offset;

        return new Vector2(arcLength, roll);
      }),
      0,
      0,
      20,
    );

    rollCurve.push(...cubicSplineCurve);
  }

  applyRollFromCurve(curve, rollCurve);
};

export const curveFromCustomTrack = (
  track: ReturnType<typeof readCustomTrack>,
  resolution: number = 20,
) => {
  if (track.vertices.length < 2) return [];

  const curve: CurveNode[] = [];
  const segmentLengths: number[] = [];
  const nurbsSections = splitPointsByStrict(track.vertices);

  for (const vertices of nurbsSections) {
    const lastCurveLength = curve.length;
    const lastCurveNode = curve[curve.length - 1];

    const points = vertices.map((v) =>
      new Vector4().fromArray(v.position),
    );

    fromPoints(
      points,
      makeClampedKnots,
      curve,
      resolution,
      3,
      lastCurveNode?.segmentIndex ?? 0,
    );

    const sectionCurve = [
      {
        matrix: new Matrix4(),
        segmentIndex: lastCurveNode?.segmentIndex ?? 0,
        arcLength: lastCurveNode?.arcLength ?? 0,
      },
      ...curve.slice(lastCurveLength),
    ];

    const sectionSegmentLengths = toSegmentLengths(sectionCurve);
    const numberOfSplits =
      vertices.length <= 4 ? vertices.length - 1 : 2;

    uniq([sectionSegmentLengths.length - 1, 0]).forEach((index) =>
      sectionSegmentLengths.splice(
        index,
        1,
        ...new Array(numberOfSplits).fill(
          sectionSegmentLengths[index] / numberOfSplits,
        ),
      ),
    );

    segmentLengths.push(...sectionSegmentLengths);
  }

  applyRollFromCustomTrack(
    curve,
    toSegmentOffsets(segmentLengths),
    track,
  );

  return curve;
};

const splitPointsByStrict = <T extends { strict: boolean }>(
  points: Array<T>,
) => {
  const result: T[][] = [];
  const indices = points.reduce<Array<number>>(
    (indices, v, i) => {
      if (v.strict || i === points.length - 1) indices.push(i);
      return indices;
    },
    [0],
  );

  for (let i = 0; i < indices.length - 1; i += 1) {
    result.push(points.slice(indices[i], indices[i + 1] + 1));
  }

  return result;
};

export const curveFromCSVUrl = async (
  url: string,
): Promise<CurveNode[]> => {
  const response = await fetch(url);
  const data = await response.text();

  return new Promise((resolve, reject) => {
    parse<{
      PosX: string;
      PosY: string;
      PosZ: string;
      FrontX: string;
      FrontY: string;
      FrontZ: string;
      LeftX: string;
      LeftY: string;
      LeftZ: string;
      UpX: string;
      UpY: string;
      UpZ: string;
    }>(
      data,
      {
        trim: true,
        columns: true,
        skip_empty_lines: true,
        delimiter: '\t',
      },
      (err, records) => {
        if (err) reject(err);
        const curve: CurveNode[] = [];
        for (const row of records) {
          insertMatrix(
            curve,
            new Matrix4()
              .makeBasis(
                new Vector3(
                  parseFloat(row.LeftX),
                  parseFloat(row.LeftY),
                  parseFloat(row.LeftZ),
                ),
                new Vector3(
                  parseFloat(row.UpX),
                  parseFloat(row.UpY),
                  parseFloat(row.UpZ),
                ),
                new Vector3(
                  parseFloat(row.FrontX),
                  parseFloat(row.FrontY),
                  parseFloat(row.FrontZ),
                ),
              )
              .setPosition(
                new Vector3(
                  parseFloat(row.PosX),
                  parseFloat(row.PosY),
                  parseFloat(row.PosZ),
                ),
              ),
          );
        }
        resolve(curve);
      },
    );
  });
};
