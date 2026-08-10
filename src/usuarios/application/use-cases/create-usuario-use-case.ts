import { IUsuarioApi, CreateUsuarioData } from "../ports/driven/usuario-api-port";
import { Usuario } from "../../domain/entities/usuario";

export class CreateUsuarioUseCase {
  constructor(private readonly usuarioApi: IUsuarioApi) {}

  async execute(token: string, data: CreateUsuarioData): Promise<Usuario> {
    return this.usuarioApi.create(token, data);
  }
}