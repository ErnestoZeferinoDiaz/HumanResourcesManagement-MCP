export interface IAuthApi {
  login(email: string, password: string): Promise<{ token: string; usuarioId: string; personaId: string; email: string; rol: string }>;
  register(data: RegisterData): Promise<{ usuarioId: string; personaId: string; email: string; rol: string }>;
  getMe(token: string): Promise<{ usuarioId: string; personaId: string; email: string; rol: string }>;
}

export interface RegisterData {
  nombre: string;
  nombresAdicionales?: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  fechaNacimiento: string;
  email: string;
  password: string;
}