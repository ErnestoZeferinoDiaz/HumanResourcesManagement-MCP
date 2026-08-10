export type Result<T, E = Error> = { success: true; data: T } | { success: false; error: E };

export type MCPToolResponse = {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
};