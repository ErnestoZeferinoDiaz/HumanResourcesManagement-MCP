import { ToolResult } from "./tool-result";
export { ToolResult } from "./tool-result";
import { ALL_TOOLS } from "../../../shared/constants/tool-definitions";

export interface ToolHandler {
  execute(args: Record<string, unknown>): Promise<ToolResult>;
}

export class HandleToolCallUseCase {
  private handlers: Map<string, ToolHandler> = new Map();

  registerTool(toolName: string, handler: ToolHandler): void {
    this.handlers.set(toolName, handler);
  }

  async execute(toolName: string, args: Record<string, unknown>): Promise<ToolResult> {
    const toolDefinition = ALL_TOOLS.find((t) => t.name === toolName);
    if (!toolDefinition) {
      return {
        content: [{ type: "text", text: `Tool "${toolName}" not found` }],
        isError: true,
      };
    }

    const handler = this.handlers.get(toolName);
    if (!handler) {
      return {
        content: [{ type: "text", text: `No handler registered for tool "${toolName}"` }],
        isError: true,
      };
    }

    try {
      return await handler.execute(args);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error executing tool "${toolName}": ${message}` }],
        isError: true,
      };
    }
  }
}