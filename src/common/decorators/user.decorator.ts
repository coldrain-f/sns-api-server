import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// @CurrentUser 를 사용하여 사용자를 얻어올 수 있다.
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
