import { Persona } from "../../../domain/entities/persona";

export interface PaginatedResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface ListPersonasParams {
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: string;
}

export interface CreatePersonaData {
  nombre: string;
  nombresAdicionales?: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  fechaNacimiento: string;
}

export interface UpdatePersonaData {
  nombre: string;
  nombresAdicionales?: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  fechaNacimiento: string;
}

export interface IPersonaApi {
  list(token: string, params: ListPersonasParams): Promise<PaginatedResult<Persona>>;
  getById(token: string, id: string): Promise<Persona>;
  create(token: string, data: CreatePersonaData): Promise<Persona>;
  update(token: string, id: string, data: UpdatePersonaData): Promise<Persona>;
  delete(token: string, id: string): Promise<void>;
}