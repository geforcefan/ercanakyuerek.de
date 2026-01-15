import React from 'react';

import { router } from '../index';

export const ContentComponentsListPage = () => {
  return (
    <ul>
      {router.routes
        .filter(({ path }) => path !== '/')
        .map(({ path }) => {
          const fullPath = `${path?.replace('./', '/')}`;
          return (
            <li key={fullPath}>
              <a href={fullPath}>{fullPath}</a>
            </li>
          );
        })}
    </ul>
  );
};
