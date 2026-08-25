import { SyntaxModal } from '../hooks/useAppState';

export const SyntaxModalsList = ({ modals }: { modals: SyntaxModal[] }) => {
  return modals.map((modal) => {
    return (
      <div className="syntax-modal" key={modal.file}>
        <div>{modal.file}</div>
        <div>{modal.text}</div>
      </div>
    );
  });
};
