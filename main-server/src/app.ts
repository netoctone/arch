import express, { type Express, type Request, type Response } from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

import { parseQueue } from './parser/parser.ts';

let activeConnections = 0;

const app: Express = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  path: '/ws'
});
io.on('connection', (socket) => {
  activeConnections += 1;
  console.log(`a user connected. total: ${activeConnections}`);
  socket.on('disconnect', (reason) => {
    activeConnections -= 1;
    console.log(`a user disconnected: "${reason}". total: ${activeConnections}`);
  });

  socket.on('getFileDependencyGraph', (filePath: string) => {
    console.log(`getFileDependencyGraph: "${filePath}"`);
    const { edges, nodes } = parseQueue(filePath, { debug: false });
    console.log(edges.length);
    socket.emit('re:getFileDependencyGraph', JSON.stringify({ edges, nodes }));
  });
});

const port = 3000;
const host = 'localhost';
server.listen(port, host, () => {
  console.log(`arch-server running at http://${host}:${port} and ws://${host}:${port}`);
});
