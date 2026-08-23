import { GetFileDependencyGraphPayload } from 'arch-shared-types';
import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { AppStateProvider, useAppState } from './hooks/useAppState';
import { buildSigmaGraphFromPayloadGraph } from './pure/build-sigma-graph';

const socket: Socket = io('ws://localhost:3000', { path: '/ws' });

const requestDependencyGraph = (filePath: string): void => {
  socket.emit('getFileDependencyGraph', filePath);
};

export const AppContent = () => {
  const [pathInput, setPathInput] = useState('');

  const { sigmaContainerRef, setSigmaGraph } = useAppState();

  // initialise once
  useEffect(() => {
    socket.on('re:getFileDependencyGraph', (result: string) => {
      const { edges, nodes } = JSON.parse(result) as GetFileDependencyGraphPayload;
      alert(`received ${edges.length} edges, ${nodes.length} nodes`);
      setSigmaGraph(buildSigmaGraphFromPayloadGraph({ edges, nodes }));
    });
  }, []);

  return (
    <div>
      <div>
        <label htmlFor="pathInput">Enter absolute path of the Angular project root src file</label>
      </div>
      <div>
        <input id="pathInput" type="text" onChange={(e) => setPathInput(e.target.value)} />
      </div>
      <div>
        <button onClick={() => requestDependencyGraph(pathInput)}>submit</button>
      </div>
      <div className="sigma-container" ref={sigmaContainerRef}></div>
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
