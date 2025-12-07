import React from 'react';
import ReactDOM from 'react-dom/client';

import { CurvesAndMatricesScene } from './posts/writing-a-roller-coaster-simulation/CurvesAndMatricesScene';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <CurvesAndMatricesScene />
  </React.StrictMode>,
);
