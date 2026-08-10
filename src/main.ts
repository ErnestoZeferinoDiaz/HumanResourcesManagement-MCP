import { loadEnvironment } from './infrastructure/config/env.js';
import { startHttpServer } from './infrastructure/transport/http-server.js';
import { startStdioServer } from './infrastructure/transport/stdio-server.js';

function parseArgs(): { http: boolean; stdio: boolean } {
  const args = process.argv.slice(2);
  const httpMode = args.includes('--http');
  const stdioMode = args.includes('--stdio');

  if (!httpMode && !stdioMode) {
    return { http: true, stdio: false };
  }

  return { http: httpMode, stdio: stdioMode };
}

async function main(): Promise<void> {
  const env = loadEnvironment();
  const { http, stdio } = parseArgs();

  if (stdio) {
    await startStdioServer();
    return;
  }

  if (http) {
    await startHttpServer(env);
    return;
  }
}

main().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});