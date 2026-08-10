import { IUsuarioApi } from "../ports/driven/usuario-api-port";
import { UsuarioDetalle } from "../../domain/entities/usuario";

export class GetUsuarioByEmailUseCase {
  constructor(private readonly usuarioApi: IUsuarioApi) {}

  async execute(token: string, email: string): Promise<UsuarioDetalle> {
    return this.usuarioApi.getByEmail(token, email);
  }
}