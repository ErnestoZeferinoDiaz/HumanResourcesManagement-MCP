import * as http from "http";
import { IUsuarioApi, ListUsuariosParams, PaginatedResult, CreateUsuarioData } from "../../application/ports/driven/usuario-api-port";
import { Usuario, UsuarioDetalle } from "../../domain/entities/usuario";

export class UsuarioHttpAdapter implements IUsuarioApi {
  constructor(private readonly backendUrl: string) {}

  async list(token: string, params: ListUsuariosParams): Promise<PaginatedResult<UsuarioDetalle>> {
    const query = this.buildQuery(params);
    const response = await this.httpRequest("GET", `/api/usuarios${query}`, null, {
      "Authorization": `Bearer ${token}`,
    });
    return JSON.parse(response);
  }

  async getByEmail(token: string, email: string): Promise<UsuarioDetalle> {
    const response = await this.httpRequest("GET", `/api/usuarios/email/${encodeURIComponent(email)}`, null, {
      "Authorization": `Bearer ${token}`,
    });
    return JSON.parse(response);
  }

  async create(token: string, data: CreateUsuarioData): Promise<Usuario> {
    const body = JSON.stringify(data);
    const response = await this.httpRequest("POST", "/api/usuarios", body, {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    });
    return JSON.parse(response);
  }

  private buildQuery(params: ListUsuariosParams): string {
    const parts: string[] = [];
    if (params.search) parts.push(`search=${encodeURIComponent(params.search)}`);
    if (params.rol) parts.push(`rol=${encodeURIComponent(params.rol)}`);
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
          resolve(data);
        });
      });

      req.on("error", reject);
      if (body) { req.write(body); }
      req.end();
    });
  }
}