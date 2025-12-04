import { useMemo } from 'react';

const useColors = () => {
  return useMemo(() => {
    return {
      primary: 0x2b2b2b,
      secondary: 0xa9b7c6,
      silent: 0x3b3d42,
      highlight: 0xcc7832,
    };
  }, []);
};

export default useColors;
