import { GetFilePayload } from 'arch-shared-types';
import Graph from 'graphology';
import Sigma from 'sigma';
import {
  createContext,
  ReactNode,
  RefObject,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react';
import { SigmaGraph } from '../pure/build-sigma-graph';

export interface SyntaxModal extends GetFilePayload {
  isClosed?: boolean;
  toAnimateAt?: number;
}

interface AppState {
  sigmaContainerRef: RefObject<HTMLDivElement | null>;
  setSigmaGraph: (sigmaGraph: SigmaGraph) => void;
  selectedNode: string | null;
  openSyntaxModal: (modal: SyntaxModal) => void;
  closeSyntaxModal: (modal: SyntaxModal) => void;
  syntaxModals: SyntaxModal[];
}

const AppStateContext = createContext<AppState | null>(null);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const sigmaContainerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [syntaxModals, setSyntaxModals] = useState<SyntaxModal[]>([]);

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
      const newModals = [...prev];
      const indexOfExisting = prev.findIndex((m) => m.file === modal.file);
      if (indexOfExisting >= 0 && newModals[indexOfExisting]) {
        newModals[indexOfExisting] = {
          ...newModals[indexOfExisting],
          ...modal,
          toAnimateAt: Temporal.Now.instant().epochMilliseconds + 1000
        };
        return newModals;
      }
      const indexOfClosed = newModals.findIndex((m) => m.isClosed);
      if (indexOfClosed >= 0) {
        newModals[indexOfClosed] = modal;
      } else {
        newModals.push(modal);
      }
      return newModals;
    });
  };
  const closeSyntaxModal = (modal: SyntaxModal) => {
    setSyntaxModals((prev) => {
      const newModals = [...prev];
      const indexOfClosed = newModals.findIndex((m) => m.file === modal.file);
      if (indexOfClosed >= 0 && newModals[indexOfClosed]) {
        newModals[indexOfClosed] = { ...newModals[indexOfClosed], isClosed: true };
      }
      return newModals;
    });
  };

  const value: AppState = {
    sigmaContainerRef,
    setSigmaGraph,
    selectedNode,
    openSyntaxModal,
    closeSyntaxModal,
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
