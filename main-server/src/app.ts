import type { GetFileDependencyGraphPayload, GetFilePayload } from 'arch-shared-types';
import express, { type Express, type Request, type Response } from 'express';
import { readFileSync } from 'node:fs';
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
    socket.emit(
      're:getFileDependencyGraph',
      JSON.stringify({ edges, nodes } satisfies GetFileDependencyGraphPayload)
    );
  });
  socket.on('getFile', (filePath: string) => {
    console.log(`getFile: "${filePath}"`);
    try {
      const text = readFileSync(filePath).toString();
      socket.emit('re:getFile', JSON.stringify({ file: filePath, text } satisfies GetFilePayload));
    } catch (e) {
      if (e instanceof Error) {
        console.log(`err:getFile: "${e.message}"`);
      }
    }
  });
});

const port = 3000;
const host = 'localhost';
server.listen(port, host, () => {
  console.log(`arch-server running at http://${host}:${port} and ws://${host}:${port}`);
});
