import Koa from "koa";
import bodyParser from "koa-bodyparser";
import logger from "koa-logger";
import { errorHandler } from "./middlewares/authValidator";
import transactionRoutes from "./routes/transactionRoutes";
import { ENV } from "./config/env";

const app = new Koa();

// Middlewares
app.use(logger());
app.use(bodyParser());
app.use(errorHandler);

// Rutas
app.use(transactionRoutes.routes());
app.use(transactionRoutes.allowedMethods());

// Inicializar servidor
const PORT = ENV.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
