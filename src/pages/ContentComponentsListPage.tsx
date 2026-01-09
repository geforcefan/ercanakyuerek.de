import React from 'react';

import { contentComponents } from '../helper/render-content-component';

export const ContentComponentsListPage = () => {
  return (
    <ul>
      {contentComponents.keys().map((path: string) => {
        const fullPath = `/src/content${path.replace('./', '/')}`;
        return (
          <li key={fullPath}>
            <a href={fullPath}>{fullPath}</a>
          </li>
        );
      })}
    </ul>
  );
};
