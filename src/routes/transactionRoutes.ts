import Router from "@koa/router";
import { signTransactionHandler } from "../controllers/transactionController";

const router = new Router();

router.post("/sign", signTransactionHandler);

export default router;
