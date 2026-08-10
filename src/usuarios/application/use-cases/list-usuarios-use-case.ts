import { IUsuarioApi, ListUsuariosParams, PaginatedResult } from "../ports/driven/usuario-api-port";
import { UsuarioDetalle } from "../../domain/entities/usuario";

export class ListUsuariosUseCase {
  constructor(private readonly usuarioApi: IUsuarioApi) {}

  async execute(token: string, params: ListUsuariosParams): Promise<PaginatedResult<UsuarioDetalle>> {
    return this.usuarioApi.list(token, params);
  }
}