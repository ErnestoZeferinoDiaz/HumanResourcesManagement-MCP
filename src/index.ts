import { loadEnvConfig } from "./shared/config/env";
import { createContainer } from "./shared/config/di";

function main(): void {
  const config = loadEnvConfig();
  const { mcpHttpServer } = createContainer(config);

  mcpHttpServer.start();

  const shutdown = () => {
    process.stderr.write("Shutting down MCP server...\n");
    mcpHttpServer.stop();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main();