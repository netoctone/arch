import React, { useState } from 'react';
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('ws://localhost:3000', { path: '/ws' });

const requestDependencyGraph = (filePath: string): void => {
  socket.emit('getFileDependencyGraph', filePath);
};

export const App = () => {
  const [pathInput, setPathInput] = useState('');
  socket.on('re:getFileDependencyGraph', (result: string) => {
    const { edges, nodes } = JSON.parse(result);
    alert(`received ${edges.length} edges`);
  });
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
    </div>
  );
};
