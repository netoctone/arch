import express, { type Express, type Request, type Response } from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const app: Express = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  path: '/ws'
});
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('chat message', (msg) => {
    console.log(`client sent message: "${msg}"`);
  });
});

const port = 3000;
const host = 'localhost';
server.listen(port, host, () => {
  console.log(`arch-server running at http://${host}:${port} and ws://${host}:${port}`);
});
