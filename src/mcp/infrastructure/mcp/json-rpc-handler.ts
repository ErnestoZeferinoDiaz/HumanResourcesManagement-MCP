import { IMcpServer } from "../../application/ports/driving/mcp-server-port";
import { JsonRpcRequest, JsonRpcResponse, JsonRpcErrorCodes } from "../../../shared/types/json-rpc";
import { HandleToolCallUseCase } from "../../application/use-cases/handle-tool-call-use-case";
import { ListToolsUseCase } from "../../application/use-cases/list-tools-use-case";

export class JsonRpcHandler implements IMcpServer {
  constructor(
    private readonly listToolsUseCase: ListToolsUseCase,
    private readonly handleToolCallUseCase: HandleToolCallUseCase,
  ) {}

  getServerInfo(): { name: string; version: string } {
    return {
      name: "human-resources-management-mcp",
      version: "1.0.0",
    };
  }

  async handleRequest(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    try {
      if (!request.method) {
        return this.errorResponse(request.id, JsonRpcErrorCodes.INVALID_REQUEST, "Method is required");
      }

      switch (request.method) {
        case "initialize":
          return this.handleInitialize(request);
        case "tools/list":
          return this.handleToolsList(request);
        case "tools/call":
          return this.handleToolsCall(request);
        default:
          return this.errorResponse(request.id, JsonRpcErrorCodes.METHOD_NOT_FOUND, `Method not found: ${request.method}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return this.errorResponse(request.id ?? null, JsonRpcErrorCodes.INTERNAL_ERROR, message);
    }
  }

  private handleInitialize(request: JsonRpcRequest): JsonRpcResponse {
    const serverInfo = this.getServerInfo();
    return {
      jsonrpc: "2.0",
      id: request.id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {},
        },
        serverInfo: {
          name: serverInfo.name,
          version: serverInfo.version,
        },
      },
    };
  }

  private handleToolsList(request: JsonRpcRequest): JsonRpcResponse {
    const tools = this.listToolsUseCase.execute();
    return {
      jsonrpc: "2.0",
      id: request.id,
      result: { tools },
    };
  }

  private async handleToolsCall(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    const toolName = request.params?.name as string | undefined;
    const args = (request.params?.arguments as Record<string, unknown>) ?? {};

    if (!toolName) {
      return this.errorResponse(request.id, JsonRpcErrorCodes.INVALID_PARAMS, "Tool name is required");
    }

    const result = await this.handleToolCallUseCase.execute(toolName, args);
    return {
      jsonrpc: "2.0",
      id: request.id,
      result,
    };
  }

  private errorResponse(id: number | string | null, code: number, message: string): JsonRpcResponse {
    return {
      jsonrpc: "2.0",
      id,
      error: { code, message },
    };
  }
}