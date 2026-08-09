import { JsonRpcRequest, JsonRpcResponse } from "../../../../shared/types/json-rpc";

export interface IMcpServer {
  handleRequest(request: JsonRpcRequest): Promise<JsonRpcResponse>;
  getServerInfo(): { name: string; version: string };
}