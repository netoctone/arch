import { useAppState } from '../hooks/useAppState';
import { SyntaxModalsList } from './SyntaxModalsList';

export const SigmaAndSyntaxModals = () => {
  const { sigmaContainerRef, syntaxModals } = useAppState();
  const modals = [...syntaxModals.values()];
  const modalsLeft = modals.filter((m, i) => i % 2 == 0);
  const modalsRight = modals.filter((m, i) => i % 2 == 1);
  return (
    <div className="sigma-and-syntax-modals">
      <div className="syntax-modals-left">
        <SyntaxModalsList modals={modalsLeft} />
      </div>
      <div className="sigma-container" ref={sigmaContainerRef}></div>
      <div className="syntax-modals-right">
        <SyntaxModalsList modals={modalsRight} />
      </div>
    </div>
  );
};
