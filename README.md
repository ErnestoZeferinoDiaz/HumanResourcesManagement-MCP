# Human Resources Management — MCP Server

Servidor MCP (Model Context Protocol) para el sistema de gestión de recursos humanos. Expone tools que un LLM o agente puede invocar mediante **Streamable HTTP** (y opcionalmente **stdio**).

---

## Stack

| Componente | Tecnología |
|---|---|
| Runtime | Node.js 20 Alpine |
| Lenguaje | TypeScript 5.7 (compilado con `tsc`, ejecutado con `node`) |
| Sistema de módulos | ESM (`"type": "module"` en package.json) |
| SDK MCP | `@modelcontextprotocol/server` v2.0.0 |
| Transporte HTTP | `WebStandardStreamableHTTPServerTransport` (stateless) |
| Transporte Stdio | `StdioServerTransport` (desde `@modelcontextprotocol/server/stdio`) |
| Validación | Zod v4 |
| Servidor HTTP | `node:http` nativo (`createServer`). **Sin Express ni frameworks.** |
| Contenedor | Docker (Dockerfile en `../docker/mcp.Dockerfile`) |

---

## Arquitectura: Clean Architecture con módulos

El código sigue **Clean Architecture (Puertos y Adaptadores)**. Las dependencias siempre apuntan hacia adentro:

```
Infrastructure ──→ Application ──→ Domain
   (adaptadores)     (casos de uso)   (lógica pura)
```

`src/shared/types.ts` es accesible desde cualquier capa.

### Estructura de directorios

```
src/
├── main.ts                              ← Entry point: elige transporte según --http / --stdio
│
├── shared/
│   └── types.ts                         ← Tipos transversales: MCPToolResponse, Result<T>
│
├── template/                            ← MÓDULO: tools de plantilla/demo
│   ├── domain/
│   │   └── entities/
│   │       └── HealthStatus.ts          ← Entidad de dominio: estado del servidor
│   ├── application/
│   │   ├── dto/
│   │   │   └── index.ts                 ← DTOs planos: GreetInput/Output, CalculateInput/Output
│   │   └── use-cases/
│   │       ├── greet/
│   │       │   ├── IGreetUseCase.ts     ← Puerto (interfaz)
│   │       │   └── GreetUseCase.ts      ← Implementación del caso de uso
│   │       ├── calculate/
│   │       │   ├── ICalculateUseCase.ts
│   │       │   └── CalculateUseCase.ts
│   │       └── health-check/
│   │           ├── IHealthCheckUseCase.ts
│   │           └── HealthCheckUseCase.ts
│   └── infrastructure/
│       └── mcp/
│           └── schemas.ts               ← Zod schemas + registerTemplateTools()
│
├── infrastructure/                       ← Infraestructura COMPARTIDA entre módulos
│   ├── config/
│   │   └── env.ts                       ← Tipado y carga de variables de entorno
│   ├── mcp/
│   │   └── server-factory.ts            ← Orquestador: crea McpServer y registra tools de todos los módulos
│   └── transport/
│       ├── http-server.ts               ← Servidor HTTP (StreamableHTTP, stateless)
│       └── stdio-server.ts              ← Servidor stdio (para MCP Inspector)
│
└── (futuro) personnel/                   ← EJEMPLO: futuro módulo que conectará al Backend
    ├── domain/...
    ├── application/...
    └── infrastructure/mcp/schemas.ts
```

### Reglas de dependencia por capa

| Capa | Puede importar de | NO puede importar de |
|---|---|---|
| `domain/` | `shared/` | `application/`, `infrastructure/` |
| `application/` | `domain/`, `shared/`, `application/dto/` | `infrastructure/` |
| `infrastructure/` (compartida) | `domain/`, `application/`, `shared/` | — |
| `<modulo>/infrastructure/` | `domain/`, `application/`, `shared/` del mismo módulo | otros módulos directamente |

### Responsabilidad de cada archivo

| Archivo | Capa | Función |
|---|---|---|
| `main.ts` | — | Punto de entrada. Parsea `--http`/`--stdio`. Por defecto HTTP. |
| `shared/types.ts` | Shared | `MCPToolResponse` (formato que espera `registerTool`), `Result<T>` |
| `infrastructure/config/env.ts` | Infra | `loadEnvironment()` → tipa `NODE_ENV`, `PORT`, `BACKEND_URL`, `LOG_LEVEL` |
| `infrastructure/mcp/server-factory.ts` | Infra | `createServerFactory()` → instancia `McpServer`, llama a `registerTemplateTools()`. **Aquí se agregan futuros módulos.** |
| `infrastructure/transport/http-server.ts` | Infra | `startHttpServer(env)` → crea `node:http` server, convierte `IncomingMessage` → Web `Request`, invoca `transport.handleRequest()`. Stateless. |
| `infrastructure/transport/stdio-server.ts` | Infra | `startStdioServer()` → `StdioServerTransport` + `server.connect()` |
| `template/domain/entities/HealthStatus.ts` | Domain | Entidad pura con factory methods `create()` y `degraded()`, método `toSummary()` |
| `template/application/dto/index.ts` | Application | DTOs planos: `GreetInput`, `GreetOutput`, `CalculateInput`, `CalculateOutput`, `HealthCheckOutput` |
| `template/application/use-cases/*/I*UseCase.ts` | Application | Puerto: interfaz del caso de uso (`execute` method) |
| `template/application/use-cases/*/*UseCase.ts` | Application | Implementación del caso de uso (lógica de negocio) |
| `template/infrastructure/mcp/schemas.ts` | Infra (módulo) | Zod schemas + `registerTemplateTools(server, version)`. Adaptador que conecta use cases con McpServer. |

---

## Flujo de una tool call

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. Cliente HTTP POST /mcp                                          │
│    Body: {"jsonrpc":"2.0","method":"tools/call","params":{...}}     │
│    Headers: Accept: application/json, text/event-stream             │
└────────────────────────────┬────────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. http-server.ts: node:http.createServer                          │
│    readRequestBody() → toWebRequest() → transport.handleRequest()  │
└────────────────────────────┬────────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. WebStandardStreamableHTTPServerTransport (stateless)            │
│    Parsea JSON-RPC, enruta al McpServer                            │
└────────────────────────────┬────────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. McpServer (creado en server-factory.ts)                         │
│    Valida input con Zod schema → ejecuta handler de la tool        │
└────────────────────────────┬────────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5. template/infrastructure/mcp/schemas.ts                          │
│    Handler: Zod valida params → crea DTO → llama UseCase.execute() │
└────────────────────────────┬────────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 6. UseCase.execute(dto) → lógica pura                              │
│    Puede usar entidades de domain/                                 │
└────────────────────────────┬────────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 7. Handler retorna { content: [{ type: "text", text: "..." }] }    │
│    McpServer → Transport → JSON-RPC response → HTTP response       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Tools actuales (módulo `template`)

| Tool | Descripción | Input | Output |
|---|---|---|---|
| `greet` | Saludo personalizado | `{ name: string }` | `"Hello, {name}! Welcome to the HRM MCP Server."` |
| `calculate` | Operaciones aritméticas | `{ operation: enum, a: number, b: number }` | `"5 add 3 = 8"` |
| `health_check` | Estado del servidor | `{}` | `"Status: healthy \| Uptime: 4m 0s \| Version: 1.0.0 \| ..."` |

---

## Guía: Cómo agregar una nueva tool

### Dentro de un módulo existente (ej: `template`)

**Paso 1:** Agregar DTOs en `src/template/application/dto/index.ts`

```ts
export class MyInput {
  constructor(public readonly param: string) {}
}
export class MyOutput {
  constructor(public readonly result: string) {}
}
```

**Paso 2:** Crear interfaz `src/template/application/use-cases/my-tool/IMyUseCase.ts`

```ts
import type { MyInput, MyOutput } from '../../dto/index.js';
export interface IMyUseCase {
  execute(input: MyInput): Promise<MyOutput>;
}
```

**Paso 3:** Crear implementación `src/template/application/use-cases/my-tool/MyUseCase.ts`

```ts
import type { IMyUseCase } from './IMyUseCase.js';
import { MyInput, MyOutput } from '../../dto/index.js';
export class MyUseCase implements IMyUseCase {
  public async execute(input: MyInput): Promise<MyOutput> {
    return new MyOutput(`Processed: ${input.param}`);
  }
}
```

**Paso 4:** Agregar Zod schema y handler en `src/template/infrastructure/mcp/schemas.ts`

```ts
const myInputSchema = z.object({
  param: z.string().describe('Description of param'),
});

// Dentro de registerTemplateTools():
server.registerTool(
  'my_tool',
  {
    description: 'What this tool does.',
    inputSchema: myInputSchema,
  },
  async (params: z.infer<typeof myInputSchema>) => {
    const input = new MyInput(params.param);
    const output = await myUseCase.execute(input);
    return {
      content: [{ type: 'text' as const, text: output.result }],
    };
  }
);
```

### Errores en tools

Para reportar errores al LLM, retorna `isError: true`:

```ts
catch (error) {
  return {
    content: [{ type: 'text' as const, text: `Error: ${error.message}` }],
    isError: true,
  };
}
```

---

## Guía: Cómo crear un nuevo módulo

Cuando necesites una funcionalidad completamente nueva (ej: conexión al backend para gestión de personal), crea un módulo:

**Paso 1:** Crear la estructura de carpetas

```
src/personnel/
├── domain/
│   └── entities/
│       └── Employee.ts
├── application/
│   ├── dto/
│   │   └── index.ts
│   └── use-cases/
│       └── get-employee/
│           ├── IGetEmployeeUseCase.ts
│           └── GetEmployeeUseCase.ts
└── infrastructure/
    └── mcp/
        └── schemas.ts           ← export function registerPersonnelTools(server, version)
```

**Paso 2:** El `schemas.ts` del módulo debe exportar una función con esta firma:

```ts
import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';

export function registerPersonnelTools(server: McpServer, version: string): void {
  const useCase = new GetEmployeeUseCase(/* dependencias */);

  server.registerTool('get_employee', {
    description: 'Get employee by ID',
    inputSchema: z.object({ id: z.string() }),
  }, async ({ id }) => {
    const output = await useCase.execute(new GetEmployeeInput(id));
    return { content: [{ type: 'text' as const, text: JSON.stringify(output) }] };
  });
}
```

**Paso 3:** Registrar el módulo en `src/infrastructure/mcp/server-factory.ts`

```ts
import { registerTemplateTools } from '../../template/infrastructure/mcp/schemas.js';
import { registerPersonnelTools } from '../../personnel/infrastructure/mcp/schemas.js'; // ← nuevo

export function createServerFactory(): McpServer {
  const server = new McpServer({ name: 'hrm-mcp', version: SERVER_VERSION });
  registerTemplateTools(server, SERVER_VERSION);
  registerPersonnelTools(server, SERVER_VERSION);  // ← nuevo
  return server;
}
```

---

## Transportes

### HTTP (Streamable HTTP) — por defecto

- **Endpoint:** `POST /mcp` (también acepta `POST /`)
- **Headers requeridos:** `Accept: application/json, text/event-stream`
- **Modo:** Stateless (`sessionIdGenerator: undefined`). Cada request es independiente.
- **Puerto:** `3001` (configurable con `PORT`)
- **Health check:** `GET /health` → `{"status":"ok"}`
- **Arranque:** `node dist/main.js` o `node dist/main.js --http`

### Stdio — opcional

- **Arranque:** `node dist/main.js --stdio`
- **Uso:** MCP Inspector o clientes que lancen el proceso como hijo
- **Logs:** Usar `console.error` (stdout es el canal del protocolo)

---

## Docker

### Dockerfile

Ubicado en `../docker/mcp.Dockerfile`. Tiene 3 stages:

| Stage | Propósito | Comando |
|---|---|---|
| `builder` | Clona repo, `npm ci`, `npm run build`, `npm prune --production` | — |
| `production` | Imagen mínima con solo `dist/` + `node_modules` prod | `node dist/index.js` |
| `development` | Copia source, instala deps, compila y ejecuta | `npm run build && node dist/main.js --http` |

### Comandos Docker Compose

```bash
# Construir sin caché
docker compose -f docker-compose.dev.yml build --no-cache mcp-server

# Ejecutar
docker compose -f docker-compose.dev.yml up mcp-server

# Ejecutar en background
docker compose -f docker-compose.dev.yml up -d mcp-server

# Ver logs
docker compose -f docker-compose.dev.yml logs -f mcp-server

# Detener
docker compose -f docker-compose.dev.yml down
```

### Volumes en desarrollo

```yaml
volumes:
  - ./HumanResourcesManagement-MCP:/app       # Código fuente (live)
  - mcp_node_modules:/app/node_modules        # node_modules preservado
```

El CMD del stage `development` ejecuta `npm run build && node dist/main.js --http`, por lo que recompila el TypeScript al iniciar el contenedor.

---

## Testing manual

### Health check

```bash
curl http://localhost:3001/health
```

### MCP: Listar tools

```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

### MCP: Inicializar conexión

```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2026-07-28","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}},"id":1}'
```

### MCP: Llamar una tool

```bash
curl -X POST http://localhost:3001/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"greet","arguments":{"name":"World"}},"id":2}'
```

---

## Variables de entorno

| Variable | Default | Descripción |
|---|---|---|
| `NODE_ENV` | `development` | Entorno (`development`, `production`, `test`) |
| `PORT` | `3001` | Puerto del servidor HTTP |
| `BACKEND_URL` | `http://localhost:8080` | URL del backend (para futura conexión) |
| `LOG_LEVEL` | `info` | Nivel de log (`debug`, `info`, `warn`, `error`) |

Se cargan desde `../.env.dev` en el contenedor de desarrollo.

---

## Convenciones de código

### Imports

Todos los imports relativos llevan extensión `.js` al final (requerido por `"moduleResolution": "NodeNext"`):

```ts
// ✅ Correcto
import { GreetUseCase } from '../../application/use-cases/greet/GreetUseCase.js';

// ❌ Incorrecto
import { GreetUseCase } from '../../application/use-cases/greet/GreetUseCase';
```

### Logging

Usar `console.error` para todos los logs. En modo stdio, `stdout` es el canal del protocolo JSON-RPC.

```ts
console.error('Server started on port 3001'); // ✅
console.log('Server started on port 3001');    // ❌ (corrompe el protocolo en stdio)
```

### Tipos literales en tool responses

```ts
return {
  content: [{ type: 'text' as const, text: 'Hello' }],
};
```

El `as const` es necesario para que TypeScript infiera el tipo literal `'text'` en lugar de `string`.

### Entidades de dominio

- Constructor `private` + factory methods estáticos (`create`, `reconstitute`)
- Propiedades privadas con prefijo `_` (`_status`, `_version`)
- Getters públicos para acceso de solo lectura
- Sin imports de `application/` ni `infrastructure/`

### DTOs

- Clases con `constructor(public readonly ...)` — objetos planos, sin lógica
- Sin dependencias externas
- Sin validaciones de negocio

### Use cases

- Interfaz (`I*UseCase`) + implementación (`*UseCase`) en archivos separados
- Reciben DTOs de entrada, retornan DTOs de salida
- Pueden usar entidades de dominio y `shared/types.ts`
- No conocen MCP, HTTP, ni Zod

---

## Dependencias npm

```json
{
  "dependencies": {
    "@modelcontextprotocol/server": "^2.0.0",
    "zod": "^4.4.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.7.0"
  }
}
```

**Nota:** El paquete `@modelcontextprotocol/server` v2 exporta desde su entry point principal `WebStandardStreamableHTTPServerTransport` y `McpServer`. `StdioServerTransport` se importa desde el subpath `@modelcontextprotocol/server/stdio`.

---

## Scripts npm

```bash
npm run build        # tsc → dist/
npm start            # node dist/main.js (HTTP por defecto)
npm run start:http   # node dist/main.js --http
npm run start:stdio  # node dist/main.js --stdio
```

---

## Resumen para un LLM

Si eres un LLM que va a modificar este código, recuerda:

1. **La lógica de negocio va en use cases** (`application/use-cases/`), nunca en schemas ni en handlers.
2. **Los DTOs son planos**, sin comportamiento. Se crean en `application/dto/`.
3. **Cada tool se registra en `<modulo>/infrastructure/mcp/schemas.ts`** con `server.registerTool(name, config, handler)`.
4. **El handler de la tool** convierte `params` (validados por Zod) → DTO → UseCase → DTO → `{ content: [...] }`.
5. **Para crear un nuevo módulo**, replica la estructura de `template/` y registra su función en `server-factory.ts`.
6. **Nunca uses `console.log`** — usa `console.error` para logs.
7. **Todos los imports relativos llevan `.js`** al final.
8. **No instales dependencias en el host** — todo se prueba dentro del contenedor Docker.