import { useMedia } from "react-recipes";
import { useMemo } from "react";

const useColors = () => {
  const prefersDarkMode = useMedia(
    ["(prefers-color-scheme: dark)"],
    [true],
    false
  );

  return useMemo(() => {
    return {
      primary: prefersDarkMode ? 0x232425 : 0xffffff,
      secondary: prefersDarkMode ? 0xffffff : 0x232425,
      silent: prefersDarkMode ? 0x3b3d42 : 0xcccccc,
    };
  }, [prefersDarkMode]);
};

export default useColors;
