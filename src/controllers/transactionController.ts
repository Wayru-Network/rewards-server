import { Context } from "koa";
import { signTransaction } from '../services/transactionService'
export const signTransactionHandler = async (ctx: Context) => {
  if (typeof ctx.request.body !== 'object' || ctx.request.body === null) {
    ctx.throw(400, 'Invalid request body');
    return;
  }
  if (!('transactionBase64' in ctx.request.body)) {
    ctx.throw(400, 'transactionBase64 is required');
    return;
  }
  const transactionBase64 = ctx.request.body.transactionBase64;
  if (typeof transactionBase64 !== 'string') {
    ctx.throw(400, 'transactionBase64 must be a string');
    return;
  }
  const signedTransaction = await signTransaction(transactionBase64);
  ctx.body = { signedTransaction };
};
