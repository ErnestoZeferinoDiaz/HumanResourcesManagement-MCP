import type { ICalculateUseCase } from './ICalculateUseCase.js';
import { CalculateInput, CalculateOutput } from '../../dto/index.js';

export class CalculateUseCase implements ICalculateUseCase {
  public async execute(input: CalculateInput): Promise<CalculateOutput> {
    const { operation, a, b } = input;

    let result: number;
    switch (operation) {
      case 'add':
        result = a + b;
        break;
      case 'subtract':
        result = a - b;
        break;
      case 'multiply':
        result = a * b;
        break;
      case 'divide':
        if (b === 0) {
          throw new Error('Division by zero is not allowed');
        }
        result = a / b;
        break;
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    return new CalculateOutput(result);
  }
}