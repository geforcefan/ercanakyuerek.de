import React, { lazy } from 'react';
import ReactDOM from 'react-dom/client';

import { createBrowserRouter, RouterProvider } from 'react-router';

import { contentComponents } from './helper/render-content-component';

const router = createBrowserRouter([
  {
    path: '/',
    Component: () => {
      return (
        <ul>
          {contentComponents.keys().map((path: string) => (
            <li>
              <a href={path}>{path}</a>
            </li>
          ))}
        </ul>
      );
    },
  },
  ...contentComponents.keys().map((path: string) => {
    return {
      path: path.replace('./', ''),
      Component: lazy(async () => {
        const module = await contentComponents(path);
        return {
          default: module.default ?? Object.values(module).pop(),
        };
      }),
    };
  }),
]);

ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
