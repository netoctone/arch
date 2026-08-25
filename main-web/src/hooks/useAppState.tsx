import { GetFilePayload } from 'arch-shared-types';
import Graph from 'graphology';
import Sigma from 'sigma';
import { createContext, ReactNode, RefObject, useContext, useEffect, useRef, useState } from 'react';
import { SigmaGraph } from '../pure/build-sigma-graph';

export interface SyntaxModal extends GetFilePayload {};

export type SyntaxModalsMap = Map<string, SyntaxModal>;

interface AppState {
  sigmaContainerRef: RefObject<HTMLDivElement | null>;
  setSigmaGraph: (sigmaGraph: SigmaGraph) => void;
  selectedNode: string | null;
  openSyntaxModal: (modal: SyntaxModal) => void;
  syntaxModals: SyntaxModalsMap;
}

const AppStateContext = createContext<AppState | null>(null);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const sigmaContainerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [syntaxModals, setSyntaxModals] = useState<SyntaxModalsMap>(new Map());

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

    sigma.on('clickNode', ({ node }) => {
      setSelectedNode(node);
    });

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

  const openSyntaxModal = (modal: SyntaxModal) => {
    setSyntaxModals((prev) => {
      const newMap = new Map(prev);
      newMap.set(modal.file, modal);
      return newMap;
    });
  };

  const value: AppState = {
    sigmaContainerRef,
    setSigmaGraph,
    selectedNode,
    openSyntaxModal,
    syntaxModals
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
