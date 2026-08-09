import * as http from "http";
import { IAuthApi, RegisterData } from "../../application/ports/driven/auth-api-port";

export class AuthHttpAdapter implements IAuthApi {
  constructor(private readonly backendUrl: string) {}

  async login(email: string, password: string): Promise<{ token: string; usuarioId: string; personaId: string; email: string; rol: string }> {
    const body = JSON.stringify({ email, password });
    const response = await this.httpRequest("POST", "/api/auth/login", body, { "Content-Type": "application/json" });
    return JSON.parse(response);
  }

  async register(data: RegisterData): Promise<{ usuarioId: string; personaId: string; email: string; rol: string }> {
    const body = JSON.stringify(data);
    const response = await this.httpRequest("POST", "/api/auth/register", body, { "Content-Type": "application/json" });
    return JSON.parse(response);
  }

  async getMe(token: string): Promise<{ usuarioId: string; personaId: string; email: string; rol: string }> {
    const response = await this.httpRequest("GET", "/api/auth/me", null, {
      "Authorization": `Bearer ${token}`,
    });
    return JSON.parse(response);
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
        headers: {
          ...headers,
        },
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

      if (body) {
        req.write(body);
      }
      req.end();
    });
  }
}