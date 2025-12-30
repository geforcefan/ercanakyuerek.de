import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { contentComponents } from './helper/render-content-component';

import { ContentComponent } from './components/ContentComponent';

import { ContentComponentsListPage } from './pages/ContentComponentsListPage';

import './themes/hello-friend-ng/assets/scss/main-webpack.scss';
import { CurvesAndMatricesScene } from './experiments/CurvesAndMatricesScene';

const router = createBrowserRouter([
  {
    path: '/',
    Component: ContentComponentsListPage,
  },
  {
    path: '/experiment',
    Component: CurvesAndMatricesScene,
  },
  ...contentComponents.keys().map((path: string) => {
    return {
      path: path.replace('./', ''),
      Component: () => <ContentComponent path={path} />,
    };
  }),
]);

ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
).render(
    <RouterProvider router={router} />,
);
