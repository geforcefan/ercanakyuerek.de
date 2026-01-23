import React from 'react';

export const LoadingScreen = () => {
  return (
    <div
      className="loading-screen full-screen"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div className={'logo'}>
        <div className={'logo__cursor'}></div>
      </div>
    </div>
  );
};
