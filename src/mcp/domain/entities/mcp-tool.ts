export interface ToolParameterSchema {
  type: "string" | "number" | "boolean" | "object" | "array";
  description: string;
  required?: boolean;
  properties?: Record<string, ToolParameterSchema>;
  items?: ToolParameterSchema;
  enum?: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, ToolParameterSchema>;
    required?: string[];
  };
}