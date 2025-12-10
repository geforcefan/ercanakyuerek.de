import React from 'react';
import ReactDOM from 'react-dom/client';

import "./styles/common.css"

import { CurvesAndMatricesScene } from './experiments/CurvesAndMatricesScene';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <CurvesAndMatricesScene />
  </React.StrictMode>,
);
