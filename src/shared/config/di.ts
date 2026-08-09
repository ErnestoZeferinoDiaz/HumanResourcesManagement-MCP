import { EnvConfig } from "./env";
import { HandleToolCallUseCase } from "../../mcp/application/use-cases/handle-tool-call-use-case";
import { ListToolsUseCase } from "../../mcp/application/use-cases/list-tools-use-case";
import { JsonRpcHandler } from "../../mcp/infrastructure/mcp/json-rpc-handler";
import { McpHttpServer } from "../../mcp/infrastructure/web/mcp-http-server";
import { IMcpServer } from "../../mcp/application/ports/driving/mcp-server-port";

import { IAuthApi } from "../../auth/application/ports/driven/auth-api-port";
import { AuthHttpAdapter } from "../../auth/infrastructure/adapters/auth-http-adapter";
import { LoginUseCase } from "../../auth/application/use-cases/login-use-case";
import { RegisterUseCase } from "../../auth/application/use-cases/register-use-case";
import { GetSessionUseCase } from "../../auth/application/use-cases/get-session-use-case";

import { IPersonaApi } from "../../personas/application/ports/driven/persona-api-port";
import { PersonaHttpAdapter } from "../../personas/infrastructure/adapters/persona-http-adapter";
import { ListPersonasUseCase } from "../../personas/application/use-cases/list-personas-use-case";
import { GetPersonaUseCase } from "../../personas/application/use-cases/get-persona-use-case";
import { CreatePersonaUseCase } from "../../personas/application/use-cases/create-persona-use-case";
import { UpdatePersonaUseCase } from "../../personas/application/use-cases/update-persona-use-case";
import { DeletePersonaUseCase } from "../../personas/application/use-cases/delete-persona-use-case";

import { IUsuarioApi } from "../../usuarios/application/ports/driven/usuario-api-port";
import { UsuarioHttpAdapter } from "../../usuarios/infrastructure/adapters/usuario-http-adapter";
import { ListUsuariosUseCase } from "../../usuarios/application/use-cases/list-usuarios-use-case";
import { GetUsuarioByEmailUseCase } from "../../usuarios/application/use-cases/get-usuario-email-use-case";
import { CreateUsuarioUseCase } from "../../usuarios/application/use-cases/create-usuario-use-case";

import { ToolResult } from "../../mcp/application/use-cases/handle-tool-call-use-case";

export interface AppContainer {
  mcpHttpServer: McpHttpServer;
}

interface SessionStore {
  setToken(token: string): void;
  getToken(): string | null;
}

function createSessionStore(): SessionStore {
  let token: string | null = null;
  let expiresAt: number | null = null;
  const DEFAULT_EXPIRATION_MS = 86400000;

  return {
    setToken(newToken: string) {
      token = newToken;
      expiresAt = Date.now() + DEFAULT_EXPIRATION_MS;
    },
    getToken(): string | null {
      if (token && expiresAt && Date.now() >= expiresAt) {
        token = null;
        expiresAt = null;
      }
      return token;
    },
  };
}

function serializeResult(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export function createContainer(config: EnvConfig): AppContainer {
  const session = createSessionStore();

  const authApi: IAuthApi = new AuthHttpAdapter(config.backendUrl);
  const personaApi: IPersonaApi = new PersonaHttpAdapter(config.backendUrl);
  const usuarioApi: IUsuarioApi = new UsuarioHttpAdapter(config.backendUrl);

  const loginUseCase = new LoginUseCase(authApi);
  const registerUseCase = new RegisterUseCase(authApi);
  const getSessionUseCase = new GetSessionUseCase(authApi);

  const listPersonasUseCase = new ListPersonasUseCase(personaApi);
  const getPersonaUseCase = new GetPersonaUseCase(personaApi);
  const createPersonaUseCase = new CreatePersonaUseCase(personaApi);
  const updatePersonaUseCase = new UpdatePersonaUseCase(personaApi);
  const deletePersonaUseCase = new DeletePersonaUseCase(personaApi);

  const listUsuariosUseCase = new ListUsuariosUseCase(usuarioApi);
  const getUsuarioByEmailUseCase = new GetUsuarioByEmailUseCase(usuarioApi);
  const createUsuarioUseCase = new CreateUsuarioUseCase(usuarioApi);

  const handleToolCallUseCase = new HandleToolCallUseCase();
  const listToolsUseCase = new ListToolsUseCase();

  const requireAuth = (): string => {
    const t = session.getToken();
    if (!t) {
      throw new Error("No autenticado. Usa la herramienta 'login' primero.");
    }
    return t;
  };

  handleToolCallUseCase.registerTool("login", {
    async execute(args: Record<string, unknown>): Promise<ToolResult> {
      const result = await loginUseCase.execute(
        args.email as string,
        args.password as string,
      );
      session.setToken(result.token);
      return { content: [{ type: "text", text: serializeResult(result) }] };
    },
  });

  handleToolCallUseCase.registerTool("register", {
    async execute(args: Record<string, unknown>): Promise<ToolResult> {
      const result = await registerUseCase.execute({
        nombre: args.nombre as string,
        nombresAdicionales: args.nombresAdicionales as string | undefined,
        apellidoPaterno: args.apellidoPaterno as string,
        apellidoMaterno: args.apellidoMaterno as string | undefined,
        fechaNacimiento: args.fechaNacimiento as string,
        email: args.email as string,
        password: args.password as string,
      });
      return { content: [{ type: "text", text: serializeResult(result) }] };
    },
  });

  handleToolCallUseCase.registerTool("get_current_session", {
    async execute(_args: Record<string, unknown>): Promise<ToolResult> {
      const token = requireAuth();
      const result = await getSessionUseCase.execute(token);
      return { content: [{ type: "text", text: serializeResult(result) }] };
    },
  });

  handleToolCallUseCase.registerTool("list_personas", {
    async execute(args: Record<string, unknown>): Promise<ToolResult> {
      const token = requireAuth();
      const result = await listPersonasUseCase.execute(token, {
        search: args.search as string | undefined,
        page: args.page as number | undefined,
        size: args.size as number | undefined,
        sortBy: args.sortBy as string | undefined,
        direction: args.direction as string | undefined,
      });
      return { content: [{ type: "text", text: serializeResult(result) }] };
    },
  });

  handleToolCallUseCase.registerTool("get_persona", {
    async execute(args: Record<string, unknown>): Promise<ToolResult> {
      const token = requireAuth();
      const result = await getPersonaUseCase.execute(token, args.id as string);
      return { content: [{ type: "text", text: serializeResult(result) }] };
    },
  });

  handleToolCallUseCase.registerTool("create_persona", {
    async execute(args: Record<string, unknown>): Promise<ToolResult> {
      const token = requireAuth();
      const result = await createPersonaUseCase.execute(token, {
        nombre: args.nombre as string,
        nombresAdicionales: args.nombresAdicionales as string | undefined,
        apellidoPaterno: args.apellidoPaterno as string,
        apellidoMaterno: args.apellidoMaterno as string | undefined,
        fechaNacimiento: args.fechaNacimiento as string,
      });
      return { content: [{ type: "text", text: serializeResult(result) }] };
    },
  });

  handleToolCallUseCase.registerTool("update_persona", {
    async execute(args: Record<string, unknown>): Promise<ToolResult> {
      const token = requireAuth();
      const result = await updatePersonaUseCase.execute(token, args.id as string, {
        nombre: args.nombre as string,
        nombresAdicionales: args.nombresAdicionales as string | undefined,
        apellidoPaterno: args.apellidoPaterno as string,
        apellidoMaterno: args.apellidoMaterno as string | undefined,
        fechaNacimiento: args.fechaNacimiento as string,
      });
      return { content: [{ type: "text", text: serializeResult(result) }] };
    },
  });

  handleToolCallUseCase.registerTool("delete_persona", {
    async execute(args: Record<string, unknown>): Promise<ToolResult> {
      const token = requireAuth();
      await deletePersonaUseCase.execute(token, args.id as string);
      return { content: [{ type: "text", text: `Persona ${args.id} desactivada exitosamente.` }] };
    },
  });

  handleToolCallUseCase.registerTool("list_usuarios", {
    async execute(args: Record<string, unknown>): Promise<ToolResult> {
      const token = requireAuth();
      const result = await listUsuariosUseCase.execute(token, {
        search: args.search as string | undefined,
        rol: args.rol as string | undefined,
        page: args.page as number | undefined,
        size: args.size as number | undefined,
        sortBy: args.sortBy as string | undefined,
        direction: args.direction as string | undefined,
      });
      return { content: [{ type: "text", text: serializeResult(result) }] };
    },
  });

  handleToolCallUseCase.registerTool("get_usuario_by_email", {
    async execute(args: Record<string, unknown>): Promise<ToolResult> {
      const token = requireAuth();
      const result = await getUsuarioByEmailUseCase.execute(token, args.email as string);
      return { content: [{ type: "text", text: serializeResult(result) }] };
    },
  });

  handleToolCallUseCase.registerTool("create_usuario", {
    async execute(args: Record<string, unknown>): Promise<ToolResult> {
      const token = requireAuth();
      const result = await createUsuarioUseCase.execute(token, {
        nombre: args.nombre as string,
        nombresAdicionales: args.nombresAdicionales as string | undefined,
        apellidoPaterno: args.apellidoPaterno as string,
        apellidoMaterno: args.apellidoMaterno as string | undefined,
        fechaNacimiento: args.fechaNacimiento as string,
        email: args.email as string,
        password: args.password as string,
        rol: args.rol as string | undefined,
      });
      return { content: [{ type: "text", text: serializeResult(result) }] };
    },
  });

  const jsonRpcHandler: IMcpServer = new JsonRpcHandler(listToolsUseCase, handleToolCallUseCase);
  const mcpHttpServer = new McpHttpServer(jsonRpcHandler, config.mcpPort);

  return { mcpHttpServer };
}