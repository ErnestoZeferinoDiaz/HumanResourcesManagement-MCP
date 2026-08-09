import { IPersonaApi, UpdatePersonaData } from "../ports/driven/persona-api-port";
import { Persona } from "../../domain/entities/persona";

export class UpdatePersonaUseCase {
  constructor(private readonly personaApi: IPersonaApi) {}

  async execute(token: string, id: string, data: UpdatePersonaData): Promise<Persona> {
    return this.personaApi.update(token, id, data);
  }
}