import { Context, Next } from 'koa';

export async function errorHandler(ctx: Context, next: Next) {
  try {
    await next();
  } catch (err: any) {
    ctx.status = err.status || 500;
    ctx.body = {
      error: true,
      message: err.message || 'Internal server error',
    };

    // Emit error for logging
    ctx.app.emit('error', err, ctx);
  }
}

// Optional: Authentication validation middleware
export async function authValidator(ctx: Context, next: Next) {
  const token = ctx.headers.authorization;

  if (!token) {
    ctx.response.status = 401;
    ctx.response.body = {
      error: true,
      message: 'Unauthorized'
    };
    return;
  }

  // add auth validation here
  await next();

}