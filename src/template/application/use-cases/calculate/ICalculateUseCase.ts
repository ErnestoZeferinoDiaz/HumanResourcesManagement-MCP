import type { CalculateInput, CalculateOutput } from '../../dto/index.js';

export interface ICalculateUseCase {
  execute(input: CalculateInput): Promise<CalculateOutput>;
}