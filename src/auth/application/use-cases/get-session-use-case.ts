import { IAuthApi } from "../ports/driven/auth-api-port";
import { Sesion } from "../../domain/entities/sesion";

export class GetSessionUseCase {
  constructor(private readonly authApi: IAuthApi) {}

  async execute(token: string): Promise<Sesion> {
    return this.authApi.getMe(token);
  }
}