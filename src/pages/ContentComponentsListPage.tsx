import React from 'react';

import { contentComponents } from '../helper/render-content-component';

export const ContentComponentsListPage = () => {
  return (
    <ul>
      {contentComponents.keys().map((path: string) => (
        <li>
          <a href={path}>{path.replace('./', '/')}</a>
        </li>
      ))}
    </ul>
  );
};
