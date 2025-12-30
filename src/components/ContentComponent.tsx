import React, { lazy, Suspense, useMemo } from 'react';
import { Leva } from 'leva';

import { numberToHexString } from '../helper/numberToHexString';
import { contentComponents } from '../helper/render-content-component';
import { useColors } from '../hooks/useColors';

import { LoadingScreen } from './LoadingScreen';

export const ContentComponent = ({ path }: { path: string }) => {
  const colors = useColors();
  const LazyComponent = useMemo(
    () =>
      lazy(async () => {
        const module = await contentComponents(path);
        return {
          default: module.default ?? Object.values(module).pop(),
        };
      }),
    [path],
  );

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Leva
        titleBar={{ filter: false, title: false }}
        theme={{
          sizes: { rootWidth: '300px' },
          shadows: {
            level1: "none",
          },
          colors: {
            accent2: numberToHexString(colors.highlight),
            accent1: numberToHexString(colors.highlight),
            elevation1: "#1b1c1d",
            elevation2: '#232425',
            elevation3: numberToHexString(colors.primary),
          },
        }}
      />
      <LazyComponent />
    </Suspense>
  );
};
