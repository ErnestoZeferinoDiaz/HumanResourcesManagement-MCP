import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/server';
import { GreetUseCase } from '../../application/use-cases/greet/GreetUseCase.js';
import { CalculateUseCase } from '../../application/use-cases/calculate/CalculateUseCase.js';
import { HealthCheckUseCase } from '../../application/use-cases/health-check/HealthCheckUseCase.js';
import { GreetInput, CalculateInput } from '../../application/dto/index.js';

const greetUseCase = new GreetUseCase();
const calculateUseCase = new CalculateUseCase();
let healthCheckUseCase: HealthCheckUseCase;

const greetInputSchema = z.object({
  name: z.string().describe('Name of the person to greet'),
});

const calculateInputSchema = z.object({
  operation: z
    .enum(['add', 'subtract', 'multiply', 'divide'])
    .describe('Arithmetic operation to perform'),
  a: z.number().describe('First operand'),
  b: z.number().describe('Second operand'),
});

export function registerTemplateTools(server: McpServer, version: string): void {
  healthCheckUseCase = new HealthCheckUseCase(version);

  server.registerTool(
    'greet',
    {
      description: 'Greet a person by name. Returns a friendly greeting message.',
      inputSchema: greetInputSchema,
    },
    async ({ name }: z.infer<typeof greetInputSchema>) => {
      const input = new GreetInput(name);
      const output = await greetUseCase.execute(input);
      return {
        content: [{ type: 'text' as const, text: output.message }],
      };
    }
  );

  server.registerTool(
    'calculate',
    {
      description:
        'Perform basic arithmetic operations (add, subtract, multiply, divide) on two numbers.',
      inputSchema: calculateInputSchema,
    },
    async (params: z.infer<typeof calculateInputSchema>) => {
      const input = new CalculateInput(params.operation, params.a, params.b);
      try {
        const output = await calculateUseCase.execute(input);
        return {
          content: [
            {
              type: 'text' as const,
              text: `${params.a} ${params.operation} ${params.b} = ${output.result}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    'health_check',
    {
      description: 'Check the health status of the HRM MCP Server. Returns uptime and version info.',
      inputSchema: z.object({}),
    },
    async () => {
      return healthCheckUseCase.execute();
    }
  );
}