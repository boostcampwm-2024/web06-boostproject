import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { BaseResponse } from './BaseResponse';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest();
    const response = context.getResponse();
    const { method, url, ip } = request;
    const status = exception instanceof HttpException ? exception.getStatus() : 500;
    const message = exception.message || exception;

    this.logger.error(
      `[RESPONSE] ${method} ${url} ${ip} - ${status} ${message} ${exception.stack}`
    );
    response.status(status).json(new BaseResponse(status, message, []));
  }
}
