import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import { createServerFactory } from '../mcp/server-factory.js';

export async function startStdioServer(): Promise<void> {
  const server = createServerFactory();
  const transport = new StdioServerTransport();

  console.error('HRM MCP Server running on stdio');

  await server.connect(transport);

  process.on('SIGINT', async () => {
    console.error('Shutting down stdio server...');
    await server.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.error('Shutting down stdio server...');
    await server.close();
    process.exit(0);
  });
}