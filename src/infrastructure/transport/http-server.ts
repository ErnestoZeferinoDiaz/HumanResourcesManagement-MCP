import http from 'node:http';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/server';
import { createServerFactory } from '../mcp/server-factory.js';
import type { Environment } from '../config/env.js';

function readRequestBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

function toWebRequest(req: http.IncomingMessage, body: string): Request {
  const host = req.headers.host || 'localhost';
  const protocol = 'http';
  const url = `${protocol}://${host}${req.url || '/'}`;

  return new Request(url, {
    method: req.method || 'GET',
    headers: Object.entries(req.headers).reduce(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = Array.isArray(value) ? value.join(', ') : value;
        }
        return acc;
      },
      {} as Record<string, string>
    ),
    body: body || undefined,
  });
}

export async function startHttpServer(env: Environment): Promise<void> {
  const server = createServerFactory();

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  await server.connect(transport);

  const httpServer = http.createServer(async (req, res) => {
    if (req.method === 'POST' && (req.url === '/mcp' || req.url === '/')) {
      try {
        const body = await readRequestBody(req);
        const webRequest = toWebRequest(req, body);
        const response = await transport.handleRequest(webRequest);

        res.writeHead(
          response.status,
          Object.fromEntries(response.headers.entries())
        );

        const responseBody = await response.text();
        res.end(responseBody);
      } catch (error) {
        console.error('Error handling MCP request:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            error: {
              code: -32603,
              message: 'Internal server error',
            },
            id: null,
          })
        );
      }
      return;
    }

    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  });

  httpServer.listen(env.PORT, '0.0.0.0', () => {
    console.error(`HRM MCP Server (HTTP) listening on http://0.0.0.0:${env.PORT}`);
    console.error(`MCP endpoint: POST http://0.0.0.0:${env.PORT}/mcp`);
    console.error(`Health check: GET  http://0.0.0.0:${env.PORT}/health`);
  });

  const shutdown = async () => {
    console.error('Shutting down HTTP server...');
    await server.close();
    await transport.close();
    httpServer.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}