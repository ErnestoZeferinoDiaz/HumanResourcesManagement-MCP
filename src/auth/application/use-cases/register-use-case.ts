import { IAuthApi, RegisterData } from "../ports/driven/auth-api-port";

export interface RegisterResult {
  usuarioId: string;
  personaId: string;
  email: string;
  rol: string;
}

export class RegisterUseCase {
  constructor(private readonly authApi: IAuthApi) {}

  async execute(data: RegisterData): Promise<RegisterResult> {
    return this.authApi.register(data);
  }
}