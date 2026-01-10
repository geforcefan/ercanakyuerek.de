import { parse } from 'csv-parse/browser/esm';
import { Matrix4, Vector3 } from 'three';

import {
  Curve,
  emptyCurve,
  insertTransformationMatrix,
} from '../maths/curve';

export const fromUrl = async (url: string): Promise<Curve> => {
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
        const curve = emptyCurve();
        for (const row of records) {
          insertTransformationMatrix(
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
