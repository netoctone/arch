import { useAppState } from '../hooks/useAppState';
import { SyntaxModalsList } from './SyntaxModalsList';

export const SigmaAndSyntaxModals = () => {
  const { sigmaContainerRef, syntaxModals, viewMode } = useAppState();
  const isFilesMode = viewMode === 'files';
  const modalsLeft = syntaxModals.filter((m, i) => i % 2 == 0);
  const modalsRight = syntaxModals.filter((m, i) => i % 2 == 1);
  return (
    <div className="sigma-and-syntax-modals">
      <div className={`syntax-modals-list ${isFilesMode ? 'syntax-modals-list--wide' : ''}`}>
        <SyntaxModalsList modals={modalsLeft} />
      </div>
      <div
        className={`sigma-container ${isFilesMode ? 'sigma-container--hidden' : ''}`}
        ref={sigmaContainerRef}
      ></div>
      <div className={`syntax-modals-list ${isFilesMode ? 'syntax-modals-list--wide' : ''}`}>
        <SyntaxModalsList modals={modalsRight} />
      </div>
    </div>
  );
};
