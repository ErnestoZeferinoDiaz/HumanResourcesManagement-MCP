function getEnv(name: string, defaultValue?: string): string {
  const value = process.env[name] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value;
}

export interface EnvConfig {
  backendUrl: string;
  mcpPort: number;
  nodeEnv: string;
}

export function loadEnvConfig(): EnvConfig {
  return {
    backendUrl: getEnv("BACKEND_URL", "http://backend:8080"),
    mcpPort: parseInt(getEnv("MCP_PORT", "3001"), 10),
    nodeEnv: getEnv("NODE_ENV", "development"),
  };
}