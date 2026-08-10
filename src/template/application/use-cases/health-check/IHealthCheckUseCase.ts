import type { MCPToolResponse } from '../../../../shared/types.js';

export interface IHealthCheckUseCase {
  execute(): Promise<MCPToolResponse>;
}