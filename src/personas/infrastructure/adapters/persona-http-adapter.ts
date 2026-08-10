import * as http from "http";
import { IPersonaApi, ListPersonasParams, PaginatedResult, CreatePersonaData, UpdatePersonaData } from "../../application/ports/driven/persona-api-port";
import { Persona } from "../../domain/entities/persona";

export class PersonaHttpAdapter implements IPersonaApi {
  constructor(private readonly backendUrl: string) {}

  async list(token: string, params: ListPersonasParams): Promise<PaginatedResult<Persona>> {
    const query = this.buildQuery(params);
    const response = await this.httpRequest("GET", `/api/personas${query}`, null, {
      "Authorization": `Bearer ${token}`,
    });
    return JSON.parse(response);
  }

  async getById(token: string, id: string): Promise<Persona> {
    const response = await this.httpRequest("GET", `/api/personas/${id}`, null, {
      "Authorization": `Bearer ${token}`,
    });
    return JSON.parse(response);
  }

  async create(token: string, data: CreatePersonaData): Promise<Persona> {
    const body = JSON.stringify(data);
    const response = await this.httpRequest("POST", "/api/personas", body, {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    });
    return JSON.parse(response);
  }

  async update(token: string, id: string, data: UpdatePersonaData): Promise<Persona> {
    const body = JSON.stringify(data);
    const response = await this.httpRequest("PUT", `/api/personas/${id}`, body, {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    });
    return JSON.parse(response);
  }

  async delete(token: string, id: string): Promise<void> {
    await this.httpRequest("DELETE", `/api/personas/${id}`, null, {
      "Authorization": `Bearer ${token}`,
    });
  }

  private buildQuery(params: ListPersonasParams): string {
    const parts: string[] = [];
    if (params.search) parts.push(`search=${encodeURIComponent(params.search)}`);
    if (params.page !== undefined) parts.push(`page=${params.page}`);
    if (params.size !== undefined) parts.push(`size=${params.size}`);
    if (params.sortBy) parts.push(`sortBy=${encodeURIComponent(params.sortBy)}`);
    if (params.direction) parts.push(`direction=${encodeURIComponent(params.direction)}`);
    return parts.length > 0 ? `?${parts.join("&")}` : "";
  }

  private httpRequest(
    method: string,
    path: string,
    body: string | null,
    headers: Record<string, string>,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const url = new URL(path, this.backendUrl);
      const options: http.RequestOptions = {
        method,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        headers: { ...headers },
      };

      const req = http.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => { data += chunk; });
        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
            return;
          }
          if (method === "DELETE" && (res.statusCode === 204 || res.statusCode === 200)) {
            resolve("");
            return;
          }
          resolve(data);
        });
      });

      req.on("error", reject);
      if (body) { req.write(body); }
      req.end();
    });
  }
}