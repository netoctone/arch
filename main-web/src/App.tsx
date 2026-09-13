import { GetFilePayload, GetFileDependencyGraphPayload } from 'arch-shared-types';
import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SigmaAndSyntaxModals } from './components/SigmaAndSyntaxModals';
import { AppStateProvider, useAppState } from './hooks/useAppState';
import { buildSigmaGraphFromPayloadGraph } from './pure/build-sigma-graph';

const socket: Socket = io('ws://localhost:3000', { path: '/ws' });

export const AppContent = () => {
  const [pathInput, setPathInput] = useState('');
  const [isFetchingGraph, setIsFetchingGraph] = useState(false);

  const {
    setSigmaGraph,
    selectedNode,
    openSyntaxModal,
    setPathPackageJson,
    pathPackageJson: pathProject,
    toggleView,
    viewMode
  } = useAppState();

  // initialise once
  useEffect(() => {
    socket.on('re:getFileDependencyGraph', (result: string) => {
      setIsFetchingGraph(false);
      const { pathPackageJson, edges, nodes } = JSON.parse(result) as GetFileDependencyGraphPayload;
      //console.log(`received ${edges.length} edges, ${nodes.length} nodes`);
      setSigmaGraph(buildSigmaGraphFromPayloadGraph({ pathPackageJson, edges, nodes }));
      setPathPackageJson(pathPackageJson);
    });
    socket.on('re:getFile', (result: string) => {
      const { file, text } = JSON.parse(result) as GetFilePayload;
      openSyntaxModal({ file, text });
    });
    return () => {
      socket.off('re:getFileDependencyGraph');
      socket.off('re:getFile');
    };
  }, []);
  useEffect(() => {
    if (!selectedNode) {
      return;
    }
    socket.emit('getFile', selectedNode);
  }, [selectedNode]);

  const requestDependencyGraph = (filePath: string): void => {
    setIsFetchingGraph(true);
    socket.emit('getFileDependencyGraph', filePath);
  };

  return (
    <div>
      <div className="app-header">
        <div>
          <label htmlFor="pathInput">
            Enter absolute path of the Angular project root src file
          </label>
        </div>
        <div>
          <input id="pathInput" type="text" onChange={(e) => setPathInput(e.target.value)} />
        </div>
        <div className="app-controls-row">
          <button onClick={() => requestDependencyGraph(pathInput)}>
            {isFetchingGraph ? 'fetching ...' : 'fetch'}
          </button>
          <button onClick={() => toggleView()}>view: {viewMode}</button>
          <div>{pathProject ? <span>project: {pathProject}</span> : null}</div>
        </div>
      </div>
      <SigmaAndSyntaxModals />
    </div>
  );
};

export const App = () => {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
};
