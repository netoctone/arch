import React from 'react';
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('ws://localhost:3000', { path: '/ws' });

export const App = () => {
  return (
    <div>hello</div>
  );
}
