import React from 'react';
import { createRoot } from 'react-dom/client';

import { ContentComponent } from '../components/ContentComponent';

import '../themes/hello-friend-ng/assets/scss/main-content-component.scss';

// @ts-ignore
export const contentComponents = require.context(
  '../content',
  true,
  /\.tsx$/,
);

const renderContentComponentByPath = async (
  rootElementId: string,
  path: string,
) => {
  const element = document.getElementById(rootElementId);

  if (!element)
    throw new Error(`Cannot find element by id: ${rootElementId}`);

  createRoot(element).render(<ContentComponent path={path} />);
};

export { renderContentComponentByPath };
