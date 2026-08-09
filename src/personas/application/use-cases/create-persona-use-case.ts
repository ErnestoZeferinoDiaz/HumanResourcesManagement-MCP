import { IPersonaApi, CreatePersonaData } from "../ports/driven/persona-api-port";
import { Persona } from "../../domain/entities/persona";

export class CreatePersonaUseCase {
  constructor(private readonly personaApi: IPersonaApi) {}

  async execute(token: string, data: CreatePersonaData): Promise<Persona> {
    return this.personaApi.create(token, data);
  }
}