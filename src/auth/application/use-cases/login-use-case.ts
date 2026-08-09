import { IAuthApi } from "../ports/driven/auth-api-port";

export interface LoginResult {
  token: string;
  usuarioId: string;
  personaId: string;
  email: string;
  rol: string;
}

export class LoginUseCase {
  constructor(private readonly authApi: IAuthApi) {}

  async execute(email: string, password: string): Promise<LoginResult> {
    return this.authApi.login(email, password);
  }
}