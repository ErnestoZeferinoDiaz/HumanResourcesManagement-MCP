export interface Persona {
  personaId: string;
  nombre: string;
  nombresAdicionales?: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  fechaNacimiento: string;
  fechaRegistro: string;
  fechaUpdate: string;
  estadoRegistro: string;
}