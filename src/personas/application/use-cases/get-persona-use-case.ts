import { IPersonaApi } from "../ports/driven/persona-api-port";
import { Persona } from "../../domain/entities/persona";

export class GetPersonaUseCase {
  constructor(private readonly personaApi: IPersonaApi) {}

  async execute(token: string, id: string): Promise<Persona> {
    return this.personaApi.getById(token, id);
  }
}