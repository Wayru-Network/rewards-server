import Koa from "koa";
import bodyParser from "koa-bodyparser";
import logger from "koa-logger";
import { errorHandler } from "./middlewares/auth-validator";
import { dbErrorHandler } from "@middlewares/db-error-handler";
import { ENV } from "@config/env/env";
import { bootstrap } from "@bootstrap";
import { shutdown } from "@bootstrap/shutdown";
import { initiateRewardsProcessing } from "@services/rewards-per-epoch/rabbit-rewards-messages/initiate-rewards-processing.service";


// start server app and services
const app = new Koa();

// Middlewares
app.use(logger());
app.use(bodyParser());
app.use(errorHandler);
app.use(dbErrorHandler);

// Global error handling
app.on('error', (err, ctx) => {
  console.error('Server Error:', err);
  shutdown(); // shutdown all services if error
});

// Initialize server
const PORT = Number(ENV.PORT);
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log('*************************************************')
});

// start all services
bootstrap().catch(err => {
  console.error('🚨 Failed to start services:', err);
  shutdown(); // shutdown all services if error
  process.exit(1);
});

//initiateRewardsProcessing(1) // this is only for testing purposes