import { IPersonaApi, ListPersonasParams, PaginatedResult } from "../ports/driven/persona-api-port";
import { Persona } from "../../domain/entities/persona";

export class ListPersonasUseCase {
  constructor(private readonly personaApi: IPersonaApi) {}

  async execute(token: string, params: ListPersonasParams): Promise<PaginatedResult<Persona>> {
    return this.personaApi.list(token, params);
  }
}