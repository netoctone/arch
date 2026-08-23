import Graph from 'graphology';
import Sigma from 'sigma';
import { createContext, ReactNode, RefObject, useContext, useEffect, useRef, useState } from 'react';
import { SigmaGraph } from '../pure/build-sigma-graph';

interface AppState {
  sigmaContainerRef: RefObject<HTMLDivElement | null>;
  setSigmaGraph: (sigmaGraph: SigmaGraph) => void;
}

const AppStateContext = createContext<AppState | null>(null);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const sigmaContainerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);

  // initialise once
  useEffect(() => {
    if (!sigmaContainerRef.current) {
      console.error('expected to have sigmaContainerRef.current to be present');
      return;
    }
    const sigma = new Sigma(new Graph(), sigmaContainerRef.current, {
      renderLabels: true
    });
    sigmaRef.current = sigma;

    return () => {
      sigma.kill();
      sigmaRef.current = null;
    };
  }, []);

  const setSigmaGraph = (sigmaGraph: SigmaGraph): void => {
    const sigma = sigmaRef.current;
    if (!sigma) {
      console.error('expected to have sigmaRef.current to be present');
      return;
    }
    sigma.setGraph(sigmaGraph);
    sigma.getCamera().animatedReset({ duration: 350 });
  };

  const value: AppState = {
    sigmaContainerRef,
    setSigmaGraph
  };
  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export const useAppState = (): AppState => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};
