export class HealthStatus {
  private readonly _status: string;
  private readonly _uptime: number;
  private readonly _version: string;
  private readonly _timestamp: Date;

  private constructor(status: string, uptime: number, version: string, timestamp: Date) {
    this._status = status;
    this._uptime = uptime;
    this._version = version;
    this._timestamp = timestamp;
  }

  public static create(uptime: number, version: string): HealthStatus {
    return new HealthStatus('healthy', uptime, version, new Date());
  }

  public static degraded(reason: string, version: string): HealthStatus {
    const status = new HealthStatus(`degraded: ${reason}`, 0, version, new Date());
    return status;
  }

  public get status(): string {
    return this._status;
  }

  public get uptime(): number {
    return this._uptime;
  }

  public get version(): string {
    return this._version;
  }

  public get timestamp(): Date {
    return this._timestamp;
  }

  public toSummary(): string {
    const uptimeMinutes = Math.floor(this._uptime / 60);
    const uptimeSeconds = Math.floor(this._uptime % 60);
    return `Status: ${this._status} | Uptime: ${uptimeMinutes}m ${uptimeSeconds}s | Version: ${this._version} | Timestamp: ${this._timestamp.toISOString()}`;
  }
}