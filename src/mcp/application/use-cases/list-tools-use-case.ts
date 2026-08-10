import { ToolDefinition } from "../../domain/entities/mcp-tool";
import { ALL_TOOLS } from "../../../shared/constants/tool-definitions";

export class ListToolsUseCase {
  execute(): ToolDefinition[] {
    return ALL_TOOLS;
  }
}