import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { tap } from 'rxjs';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
	private logger = new Logger(HttpLoggingInterceptor.name);

	intercept(context: ExecutionContext, next: CallHandler<any>) {
		const { method, url, ip } = context.switchToHttp().getRequest();
		this.logger.log(`[REQUEST] ${method} ${url} ${ip}`);
		const now = Date.now();

		return next.handle().pipe(
			tap(() => {
				const { statusCode } = context.switchToHttp().getResponse();
				const delay = Date.now() - now;
				this.logger.log(
					`[RESPONSE] ${method} ${url} ${ip} - ${statusCode} \x1b[33m+${delay}ms\x1b[0m`
				);
			})
		);
	}
}
