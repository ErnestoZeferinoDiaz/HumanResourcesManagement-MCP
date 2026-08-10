import { ToolDefinition } from "../../mcp/domain/entities/mcp-tool";

export const ALL_TOOLS: ToolDefinition[] = [
  {
    name: "login",
    description: "Inicia sesión con email y contraseña. Retorna un token JWT y datos de sesión.",
    inputSchema: {
      type: "object" as const,
      properties: {
        email: { type: "string" as const, description: "Correo electrónico del usuario" },
        password: { type: "string" as const, description: "Contraseña del usuario" },
      },
      required: ["email", "password"],
    },
  },
  {
    name: "register",
    description: "Registra un nuevo usuario junto con sus datos personales.",
    inputSchema: {
      type: "object" as const,
      properties: {
        nombre: { type: "string" as const, description: "Nombre de la persona" },
        nombresAdicionales: { type: "string" as const, description: "Nombres adicionales (opcional)" },
        apellidoPaterno: { type: "string" as const, description: "Apellido paterno" },
        apellidoMaterno: { type: "string" as const, description: "Apellido materno (opcional)" },
        fechaNacimiento: { type: "string" as const, description: "Fecha de nacimiento (formato YYYY-MM-DD)" },
        email: { type: "string" as const, description: "Correo electrónico" },
        password: { type: "string" as const, description: "Contraseña (mín 8 caracteres, mayúscula, especial, dígito)" },
      },
      required: ["nombre", "apellidoPaterno", "fechaNacimiento", "email", "password"],
    },
  },
  {
    name: "get_current_session",
    description: "Obtiene la sesión actual del usuario autenticado.",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "list_personas",
    description: "Lista personas del sistema con paginación y búsqueda.",
    inputSchema: {
      type: "object" as const,
      properties: {
        search: { type: "string" as const, description: "Texto de búsqueda por nombre o apellidos (opcional)" },
        page: { type: "number" as const, description: "Número de página (por defecto 0)" },
        size: { type: "number" as const, description: "Tamaño de página (por defecto 10)" },
        sortBy: { type: "string" as const, description: "Campo de ordenamiento (nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, fechaRegistro)", enum: ["nombre", "apellidoPaterno", "apellidoMaterno", "fechaNacimiento", "fechaRegistro"] },
        direction: { type: "string" as const, description: "Dirección de ordenamiento", enum: ["asc", "desc"] },
      },
      required: [],
    },
  },
  {
    name: "get_persona",
    description: "Obtiene una persona por su ID.",
    inputSchema: {
      type: "object" as const,
      properties: {
        id: { type: "string" as const, description: "ID de la persona" },
      },
      required: ["id"],
    },
  },
  {
    name: "create_persona",
    description: "Crea una nueva persona en el sistema.",
    inputSchema: {
      type: "object" as const,
      properties: {
        nombre: { type: "string" as const, description: "Nombre de la persona" },
        nombresAdicionales: { type: "string" as const, description: "Nombres adicionales (opcional)" },
        apellidoPaterno: { type: "string" as const, description: "Apellido paterno" },
        apellidoMaterno: { type: "string" as const, description: "Apellido materno (opcional)" },
        fechaNacimiento: { type: "string" as const, description: "Fecha de nacimiento (formato YYYY-MM-DD)" },
      },
      required: ["nombre", "apellidoPaterno", "fechaNacimiento"],
    },
  },
  {
    name: "update_persona",
    description: "Actualiza los datos de una persona existente.",
    inputSchema: {
      type: "object" as const,
      properties: {
        id: { type: "string" as const, description: "ID de la persona a actualizar" },
        nombre: { type: "string" as const, description: "Nombre de la persona" },
        nombresAdicionales: { type: "string" as const, description: "Nombres adicionales (opcional)" },
        apellidoPaterno: { type: "string" as const, description: "Apellido paterno" },
        apellidoMaterno: { type: "string" as const, description: "Apellido materno (opcional)" },
        fechaNacimiento: { type: "string" as const, description: "Fecha de nacimiento (formato YYYY-MM-DD)" },
      },
      required: ["id", "nombre", "apellidoPaterno", "fechaNacimiento"],
    },
  },
  {
    name: "delete_persona",
    description: "Desactiva (soft-delete) una persona por su ID.",
    inputSchema: {
      type: "object" as const,
      properties: {
        id: { type: "string" as const, description: "ID de la persona a desactivar" },
      },
      required: ["id"],
    },
  },
  {
    name: "list_usuarios",
    description: "Lista usuarios del sistema con paginación, búsqueda y filtro por rol.",
    inputSchema: {
      type: "object" as const,
      properties: {
        search: { type: "string" as const, description: "Texto de búsqueda por email (opcional)" },
        rol: { type: "string" as const, description: "Filtro por rol (ADMIN, MANAGER, USER)", enum: ["ADMIN", "MANAGER", "USER"] },
        page: { type: "number" as const, description: "Número de página (por defecto 0)" },
        size: { type: "number" as const, description: "Tamaño de página (por defecto 10)" },
        sortBy: { type: "string" as const, description: "Campo de ordenamiento (email, rol, fechaRegistro)", enum: ["email", "rol", "fechaRegistro"] },
        direction: { type: "string" as const, description: "Dirección de ordenamiento", enum: ["asc", "desc"] },
      },
      required: [],
    },
  },
  {
    name: "get_usuario_by_email",
    description: "Obtiene los detalles de un usuario por su email.",
    inputSchema: {
      type: "object" as const,
      properties: {
        email: { type: "string" as const, description: "Email del usuario a buscar" },
      },
      required: ["email"],
    },
  },
  {
    name: "create_usuario",
    description: "Crea un nuevo usuario junto con sus datos personales. Permite especificar el rol.",
    inputSchema: {
      type: "object" as const,
      properties: {
        nombre: { type: "string" as const, description: "Nombre de la persona" },
        nombresAdicionales: { type: "string" as const, description: "Nombres adicionales (opcional)" },
        apellidoPaterno: { type: "string" as const, description: "Apellido paterno" },
        apellidoMaterno: { type: "string" as const, description: "Apellido materno (opcional)" },
        fechaNacimiento: { type: "string" as const, description: "Fecha de nacimiento (formato YYYY-MM-DD)" },
        email: { type: "string" as const, description: "Correo electrónico" },
        password: { type: "string" as const, description: "Contraseña (mín 8 caracteres, mayúscula, especial, dígito)" },
        rol: { type: "string" as const, description: "Rol del usuario (por defecto USER)", enum: ["ADMIN", "MANAGER", "USER"] },
      },
      required: ["nombre", "apellidoPaterno", "fechaNacimiento", "email", "password"],
    },
  },
];