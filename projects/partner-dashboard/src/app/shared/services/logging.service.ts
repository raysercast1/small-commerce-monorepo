import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {

  info(message: string, ...optionalParams: any[]): void {
    console.info(`[INFO] ${message}`, ...optionalParams);
  }

  warn(message: string, ...optionalParams: any[]): void {
    console.warn(`[WARN] ${message}`, ...optionalParams);
  }

  error(message: string, ...optionalParams: any[]): void {
    console.error(`[ERROR] ${message}`, ...optionalParams);
  }

  debug(message: string, ...optionalParams: any[]): void {
    // In a real app, you might tie this to environment.production
    console.debug(`[DEBUG] ${message}`, ...optionalParams);
  }
}
