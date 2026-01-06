import React, {
  lazy,
  Suspense,
  useMemo,
  useRef,
} from 'react';
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/react/24/solid';
import { Leva } from 'leva';
import { useFullscreen, useToggle } from 'react-use';

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

  const ref = useRef(null);
  const [show, toggle] = useToggle(false);
  // @ts-ignore
  const isFullscreen = useFullscreen(ref, show, {
    onClose: () => toggle(false),
  });

  return (
    <div ref={ref} className="full-screen content-component">
      <div className="content">
        <Suspense fallback={<LoadingScreen />}>
          <Leva
            titleBar={{ filter: false, title: false }}
            theme={{
              sizes: { rootWidth: '300px' },
              shadows: {
                level1: 'none',
              },
              colors: {
                accent2: numberToHexString(colors.highlight),
                accent1: numberToHexString(colors.highlight),
                elevation1: '#1b1c1d',
                elevation2: '#232425',
                elevation3: numberToHexString(colors.primary),
              },
            }}
          />
          <LazyComponent />
        </Suspense>
      </div>
      <div
        style={{ backgroundColor: numberToHexString(colors.primary) }}
        className={`bottom-controls ${
          isFullscreen ? 'is-full-screen' : ''
        }`}
      >
        <button onClick={() => toggle()}>
          {!isFullscreen ? (
            <ArrowsPointingOutIcon />
          ) : (
            <ArrowsPointingInIcon />
          )}
        </button>
      </div>
    </div>
  );
};
