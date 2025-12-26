import React, { lazy, Suspense, useMemo } from 'react';

import { contentComponents } from '../helper/render-content-component';

export const ContentComponent = ({ path }: { path: string }) => {
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
    <Suspense fallback={<>Loading...</>}>
      <LazyComponent />
    </Suspense>
  );
};
