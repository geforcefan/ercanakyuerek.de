import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useControls } from 'leva';

import { LoadingScreen } from '../LoadingScreen';

type CameraViewManagerContextType = {
  registerView: (name: string, makeDefault?: boolean) => void;
  unregisterView: (name: string) => void;
  activeView?: string;
};

const CameraViewManagerContext =
  createContext<CameraViewManagerContextType | null>(null);

export const useCameraViewManager = () => {
  const ctx = useContext(CameraViewManagerContext);
  if (!ctx) {
    throw new Error(
      'CameraView must be used within CameraViewManager',
    );
  }
  return ctx;
};
export const CameraViewManager: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [views, setViews] = useState<string[]>([]);
  const [showLoading, setShowLoading] = useState(true);

  const [{ activeView }, setCameraViews] = useControls(
    'Camera Views',
    () => ({
      activeView: {
        options: views,
      },
    }),
    [views],
  );

  useEffect(() => {
    const id = setTimeout(() => setShowLoading(false), 500);
    return () => clearTimeout(id);
  }, []);

  const registerView = useCallback(
    (name: string, makeDefault?: boolean) => {
      setViews((prev) => [...prev, name]);
      if (makeDefault)
        setTimeout(() => setCameraViews({ activeView: name }), 50);
    },
    [setCameraViews],
  );

  const unregisterView = useCallback((name: string) => {
    setViews((prev) => prev.filter((view) => view !== name));
  }, []);

  const contextValue = useMemo(
    () => ({
      registerView,
      unregisterView,
      activeView,
    }),
    [registerView, unregisterView, activeView],
  );

  return (
    <CameraViewManagerContext.Provider value={contextValue}>
      {children}
      {showLoading && <LoadingScreen />}
    </CameraViewManagerContext.Provider>
  );
};

export const CameraView: React.FC<{
  name: string;
  makeDefault?: boolean;
  children: ReactNode;
}> = ({ name, makeDefault, children }) => {
  const { registerView, unregisterView, activeView } =
    useCameraViewManager();

  useEffect(() => {
    registerView(name, makeDefault);
    return () => unregisterView(name);
  }, [name, makeDefault, registerView, unregisterView]);

  if (activeView !== name) return null;

  return <>{children}</>;
};
