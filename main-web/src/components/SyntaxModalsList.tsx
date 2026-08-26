import { SyntaxModal, useAppState } from '../hooks/useAppState';

export const SyntaxModalsList = ({ modals }: { modals: SyntaxModal[] }) => {
  const { closeSyntaxModal } = useAppState();

  return modals.map((modal, i) => {
    const isAnimated =
      modal.toAnimateAt && modal.toAnimateAt > Temporal.Now.instant().epochMilliseconds;
    return modal.isClosed ? (
      <div className="syntax-modal" key={i}></div>
    ) : (
      <div className={`syntax-modal ${isAnimated ? 'syntax-modal--animated' : ''}`} key={i}>
        <div className="syntax-modal-close" onClick={() => closeSyntaxModal(modal)}>
          (x)
        </div>
        <div>{modal.file}</div>
        <div>{modal.text}</div>
      </div>
    );
  });
};
