import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseResponse } from '../BaseResponse';
import { RESPONSE_STATUS } from '../decorator/response-status.decorator';
import { RESPONSE_MESSAGE } from '../decorator/response-message.decorator';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, BaseResponse> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<BaseResponse> {
    const status = this.reflector.get<number>(RESPONSE_STATUS, context.getHandler()) || 200;
    const message =
      this.reflector.get<string>(RESPONSE_MESSAGE, context.getHandler()) ||
      '요청이 성공적으로 처리되었습니다.';

    return next.handle().pipe(map((data) => BaseResponse.create(status, message, data)));
  }
}
