import React from 'react';
import { createRoot } from 'react-dom/client';

import '../themes/hello-friend-ng/assets/scss/scripts.scss'

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
  const module = await contentComponents(path);

  if (!element)
    throw new Error(`Cannot find element by id: ${rootElementId}`);

  if (!module)
    throw new Error(
      `Cannot find component by path: ${path}. Candidates are: ${Object.keys(
        contentComponents,
      ).join(',\n')}`,
    );

  const Component = module.default || Object.values(module).pop();

  if (!Component) {
    throw new Error(`Component has no exports: ${path}`);
  }

  createRoot(element).render(<Component />);
};

export { renderContentComponentByPath };
