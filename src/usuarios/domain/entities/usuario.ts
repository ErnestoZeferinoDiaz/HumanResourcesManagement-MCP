export interface Usuario {
  usuarioId: string;
  personaId: string;
  email: string;
  fechaRegistro: string;
  fechaUpdate: string;
  estadoUsuario: string;
  rol: string;
}

export interface UsuarioDetalle {
  usuarioId: string;
  personaId: string;
  nombre: string;
  nombresAdicionales?: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  fechaNacimiento: string;
  email: string;
  fechaRegistro: string;
  fechaUpdate: string;
  estadoUsuario: string;
  rol: string;
}