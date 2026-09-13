import { Prism as PrismSyntaxHighlighter } from 'react-syntax-highlighter';
import { SyntaxModal, useAppState } from '../hooks/useAppState';
import { getPathRelativeToPackageJson } from '../pure/get-path-relative-to-package-json';

const extToLanguage: Record<string, string | undefined> = {
  ts: 'typescript',
  mts: 'typescript',
  js: 'javascript',
  mjs: 'jaascript'
};

const getLanguageFromFilePath = (filePath: string): string | undefined => {
  const ext = filePath.split('.').at(-1) || '';
  return extToLanguage[ext];
};

export const SyntaxModalComponent = ({ modal }: { modal: SyntaxModal }) => {
  const { closeSyntaxModal, pathPackageJson } = useAppState();
  const relativePath = getPathRelativeToPackageJson(modal.file, pathPackageJson);

  const isAnimated =
    modal.toAnimateAt && modal.toAnimateAt > Temporal.Now.instant().epochMilliseconds;
  return modal.isClosed ? (
    <div className="syntax-modal"></div>
  ) : (
    <div className="syntax-modal">
      <div className={`syntax-modal-title ${isAnimated ? 'syntax-modal-title--animated' : ''}`}>
        <div className="syntax-modal-fname" title={modal.file}>
          {relativePath}
        </div>
        <div className="syntax-modal-close" onClick={() => closeSyntaxModal(modal)}>
          (x)
        </div>
      </div>
      <div className="syntax-modal-content">
        <PrismSyntaxHighlighter language={getLanguageFromFilePath(modal.file)}>
          {modal.text}
        </PrismSyntaxHighlighter>
      </div>
    </div>
  );
};
