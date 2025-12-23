import { useCallback, useRef, useState } from 'react';

export const useMeasure = <T extends Element>() => {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });

  const previousObserver = useRef<ResizeObserver>(null);

  const ref = useCallback((node: T) => {
    if (previousObserver.current) {
      previousObserver.current.disconnect();
      previousObserver.current = null;
    }

    if (node?.nodeType === Node.ELEMENT_NODE) {
      const observer = new ResizeObserver(([entry]) => {
        if (entry && entry.borderBoxSize) {
          const { inlineSize: width, blockSize: height } =
            entry.borderBoxSize[0];

          setDimensions({ width, height });
        }
      });

      observer.observe(node);
      previousObserver.current = observer;
    }
  }, []);

  return {
    ref,
    dimensions,
  };
};
