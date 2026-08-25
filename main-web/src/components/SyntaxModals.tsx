import { useAppState } from '../hooks/useAppState';

export const SyntaxModals = () => {
  const { syntaxModals } = useAppState();
  return (
    <div>
      {[...syntaxModals.values()].map((modal) => (
        <div key={modal.file}>{modal.file}</div>
      ))}
    </div>
  );
};
