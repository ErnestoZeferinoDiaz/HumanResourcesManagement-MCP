import { Usuario, UsuarioDetalle } from "../../../domain/entities/usuario";

export interface PaginatedResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface ListUsuariosParams {
  search?: string;
  rol?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: string;
}

export interface CreateUsuarioData {
  nombre: string;
  nombresAdicionales?: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  fechaNacimiento: string;
  email: string;
  password: string;
  rol?: string;
}

export interface IUsuarioApi {
  list(token: string, params: ListUsuariosParams): Promise<PaginatedResult<UsuarioDetalle>>;
  getByEmail(token: string, email: string): Promise<UsuarioDetalle>;
  create(token: string, data: CreateUsuarioData): Promise<Usuario>;
}