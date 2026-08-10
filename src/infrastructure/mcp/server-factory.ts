import { McpServer } from '@modelcontextprotocol/server';
import { registerTemplateTools } from '../../template/infrastructure/mcp/schemas.js';

const SERVER_NAME = 'hrm-mcp';
const SERVER_VERSION = '1.0.0';

export function createServerFactory(): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  registerTemplateTools(server, SERVER_VERSION);

  return server;
}