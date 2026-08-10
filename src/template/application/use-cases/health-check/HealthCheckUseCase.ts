import type { IHealthCheckUseCase } from './IHealthCheckUseCase.js';
import type { MCPToolResponse } from '../../../../shared/types.js';
import { HealthStatus } from '../../../domain/entities/HealthStatus.js';

export class HealthCheckUseCase implements IHealthCheckUseCase {
  private readonly startTime: number;
  private readonly version: string;

  constructor(version: string) {
    this.startTime = Date.now();
    this.version = version;
  }

  public async execute(): Promise<MCPToolResponse> {
    const uptimeSeconds = (Date.now() - this.startTime) / 1000;
    const health = HealthStatus.create(uptimeSeconds, this.version);

    return {
      content: [{ type: 'text', text: health.toSummary() }],
    };
  }
}