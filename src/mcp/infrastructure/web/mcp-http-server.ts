import * as http from "http";
import { IMcpServer } from "../../application/ports/driving/mcp-server-port";
import { JsonRpcRequest, JsonRpcResponse, JsonRpcErrorCodes } from "../../../shared/types/json-rpc";

export class McpHttpServer {
  private server: http.Server | null = null;

  constructor(
    private readonly mcpServer: IMcpServer,
    private readonly port: number,
  ) {}

  start(): void {
    this.server = http.createServer((req, res) => {
      this.handleRequest(req, res).catch(() => {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Internal server error" }));
      });
    });

    this.server.listen(this.port, () => {
      process.stderr.write(`MCP server listening on port ${this.port}\n`);
    });
  }

  stop(): void {
    if (this.server) {
      this.server.close();
    }
  }

  private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.end();
      return;
    }

    if (req.url !== "/mcp" || req.method !== "POST") {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Not found" }));
      return;
    }

    const body = await this.readBody(req);

    let request: JsonRpcRequest;
    try {
      request = JSON.parse(body);
    } catch {
      const response: JsonRpcResponse = {
        jsonrpc: "2.0",
        id: null,
        error: { code: JsonRpcErrorCodes.PARSE_ERROR, message: "Parse error" },
      };
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(response));
      return;
    }

    if (request.jsonrpc !== "2.0") {
      const response: JsonRpcResponse = {
        jsonrpc: "2.0",
        id: request.id ?? null,
        error: { code: JsonRpcErrorCodes.INVALID_REQUEST, message: "Invalid JSON-RPC version" },
      };
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(response));
      return;
    }

    const response = await this.mcpServer.handleRequest(request);

    if (request.id === null) {
      res.statusCode = 204;
      res.end();
      return;
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(response));
  }

  private readBody(req: http.IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      let data = "";
      req.on("data", (chunk) => { data += chunk; });
      req.on("end", () => resolve(data));
      req.on("error", reject);
    });
  }
}