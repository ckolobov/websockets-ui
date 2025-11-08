import { WebSocketServer, WebSocket } from 'ws';
import { messageHandler } from './messageHandler.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

let wss: WebSocketServer | null = null;

const main = (): void => {
  wss = new WebSocketServer({ port: PORT });

  wss.on('listening', () => {
    const address = wss?.address();
    console.log('='.repeat(50));
    console.log('WebSocket Server Started');
    console.log('='.repeat(50));
    if (address && typeof address === 'object') {
      console.log(`Host: ${address.address}`);
      console.log(`Port: ${address.port}`);
      console.log(`Family: ${address.family}`);
    }
    console.log(`URL: ws://localhost:${PORT}`);
    console.log('='.repeat(50));
  });

  wss.on('connection', (ws: WebSocket, request) => {
    const clientIp = request.socket.remoteAddress;
    console.log(`New client connected from ${clientIp}`);

    ws.on('message', (message: string) => {
      const response: string = messageHandler(message);
      ws.send(response);
    });

    ws.on('close', () => {
      console.log(`Client disconnected: ${clientIp}`);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error: ${error.message}`);
    });
  });

  wss.on('error', (error) => {
    console.error(`Server error: ${error.message}`);
  });
};

// Graceful shutdown handler
const shutdown = (signal: string): void => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  if (wss) {
    // Close all client connections
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.close(1000, 'Server shutting down');
      }
    });

    // Close the server
    wss.close(() => {
      console.log('WebSocket server closed');
      process.exit(0);
    });

    // Force exit after timeout
    global.setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 5000);
  } else {
    process.exit(0);
  }
};

// Register shutdown handlers
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  shutdown('unhandledRejection');
});

// Start the server
try {
  main();
} catch (error) {
  console.error('Error starting server:', error);
  process.exit(1);
}
