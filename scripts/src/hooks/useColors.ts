import { useMemo } from 'react';

const useColors = () => {
  return useMemo(() => {
    return {
      primary: 0x2b2b2b,
      silent: 0x404040,
      secondary: 0xa9b7c6,
      highlight: 0xcc7832,
    };
  }, []);
};

export default useColors;
