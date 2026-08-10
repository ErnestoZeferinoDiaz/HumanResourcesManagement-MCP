import type { GreetInput, GreetOutput } from '../../dto/index.js';

export interface IGreetUseCase {
  execute(input: GreetInput): Promise<GreetOutput>;
}