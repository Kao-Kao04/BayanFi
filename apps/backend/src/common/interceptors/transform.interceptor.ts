import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T> {
  success: true;
  data: T;
  meta?: unknown;
}

/**
 * Wraps successful responses in the standard envelope. If a handler
 * already returns { data, meta }, that shape is preserved.
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>> {
    return next.handle().pipe(
      map((payload: any) => {
        if (payload && typeof payload === 'object' && 'data' in payload && 'meta' in payload) {
          return { success: true, data: payload.data, meta: payload.meta };
        }
        return { success: true, data: payload };
      })
    );
  }
}
