import type { IGreetUseCase } from './IGreetUseCase.js';
import { GreetInput, GreetOutput } from '../../dto/index.js';

export class GreetUseCase implements IGreetUseCase {
  public async execute(input: GreetInput): Promise<GreetOutput> {
    const message = `Hello, ${input.name}! Welcome to the HRM MCP Server.`;
    return new GreetOutput(message);
  }
}