import { ENV } from "@config/env/env";
import { processWubiRabbitResponse } from "@services/rewards-per-epoch/rabbit-rewards-consumers/process-wubi-response.service";
import { rabbitWrapper } from "./rabbitmq.service";
import { ConsumeMessage } from "amqplib";
import { processWupiRabbitResponse } from "@services/rewards-per-epoch/rabbit-rewards-consumers/process-wupi-response.service";


export const initializeRabbitConsumers = async () => {
    try {
        await rabbitWrapper.consumeResponse(async (msg: ConsumeMessage) => {
            processWubiRabbitResponse(msg);
        }, ENV.RABBIT_QUEUES.WUBI_API_QUEUE);
        await rabbitWrapper.consumeResponse(async (msg: ConsumeMessage) => {
            processWupiRabbitResponse(msg);
        }, ENV.RABBIT_QUEUES.WUPI_API_QUEUE);
        // @TODO: add other consumers here ⬇️
        console.log('🐇 RabbitMQ consumers initialized');
    } catch (error) {
        console.error('🚨 Failed to initialize RabbitMQ consumers:', error);
        throw error;
    }
}