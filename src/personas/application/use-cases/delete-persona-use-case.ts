import { IPersonaApi } from "../ports/driven/persona-api-port";

export class DeletePersonaUseCase {
  constructor(private readonly personaApi: IPersonaApi) {}

  async execute(token: string, id: string): Promise<void> {
    return this.personaApi.delete(token, id);
  }
}