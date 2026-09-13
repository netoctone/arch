import { Fragment } from 'react';
import { SyntaxModal } from '../hooks/useAppState';
import { SyntaxModalComponent } from './SyntaxModalComponent';

export const SyntaxModalsList = ({ modals }: { modals: SyntaxModal[] }) => {
  return modals.map((modal, i) => {
    return (
      <Fragment key={i}>
        <SyntaxModalComponent modal={modal}></SyntaxModalComponent>
      </Fragment>
    );
  });
};
