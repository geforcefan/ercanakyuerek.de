import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { contentComponents } from './helper/render-content-component';

import { ContentComponent } from './components/ContentComponent';

import { ContentComponentsListPage } from './pages/ContentComponentsListPage';

import './themes/hello-friend-ng/assets/scss/main-webpack.scss';

import { NoLimitsTrackScene } from './experiments/NoLimitsTrack';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: ContentComponentsListPage,
  },
  {
    path: '/experiment',
    Component: NoLimitsTrackScene,
  },
  ...contentComponents.keys().map((path: string) => {
    return {
      path: '/src/content/' + path.replace('./', ''),
      Component: () => <ContentComponent path={path} />,
    };
  }),
]);

ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
