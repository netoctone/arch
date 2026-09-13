import { Prism as PrismSyntaxHighlighter } from 'react-syntax-highlighter';
import { SyntaxModal, useAppState } from '../hooks/useAppState';

export const SyntaxModalComponent = ({ modal }: { modal: SyntaxModal }) => {
  const { closeSyntaxModal } = useAppState();

  const isAnimated =
    modal.toAnimateAt && modal.toAnimateAt > Temporal.Now.instant().epochMilliseconds;
  return modal.isClosed ? (
    <div className="syntax-modal"></div>
  ) : (
    <div className={`syntax-modal ${isAnimated ? 'syntax-modal--animated' : ''}`}>
      <div className="syntax-modal-close" onClick={() => closeSyntaxModal(modal)}>
        (x)
      </div>
      <div>{modal.file}</div>
      <PrismSyntaxHighlighter language={modal.file.endsWith('.ts') ? 'typescript' : undefined}>
        {modal.text}
      </PrismSyntaxHighlighter>
    </div>
  );
};
