export class GreetInput {
  constructor(public readonly name: string) {}
}

export class GreetOutput {
  constructor(public readonly message: string) {}
}

export class CalculateInput {
  constructor(
    public readonly operation: 'add' | 'subtract' | 'multiply' | 'divide',
    public readonly a: number,
    public readonly b: number
  ) {}
}

export class CalculateOutput {
  constructor(public readonly result: number) {}
}

export class HealthCheckOutput {
  constructor(public readonly status: string) {}
}