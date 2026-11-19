import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(error: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    if (response.headersSent) {
      response.end();
      return;
    }
    const path = http.getRequest<Request>().path;
    const statusCode = error instanceof HttpException ? error.getStatus() : 500;
    const body = error instanceof HttpException ? error.getResponse() : {};
    const details = typeof body === 'object' ? body as Record<string, unknown> : {};
    const code = typeof details.code === 'string' ? details.code : HttpStatus[statusCode] ?? 'HTTP_ERROR';
    const message = statusCode >= 500 && !(error instanceof HttpException)
      ? 'Internal server error'
      : details.message ?? body;
    if (!(error instanceof HttpException)) {
      this.logger.error(`Unhandled ${error instanceof Error ? error.name : 'exception'}`);
    }
    response.status(statusCode).json({ ...details, statusCode, code, message, path });
  }
}
