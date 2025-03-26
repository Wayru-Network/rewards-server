import { ENV } from "@config/env/env";
import { processRabbitResponse } from "@services/rewards-per-epoch/rabbit-rewards-processors/process-wubi-response.service";
import { rabbitWrapper } from "./rabbitmq.service";
import { ConsumeMessage } from "amqplib";


export const initializeRabbitConsumers = async () => {
    try {
        await rabbitWrapper.consumeResponse(async (msg: ConsumeMessage) => {
            console.log('****** new consume response ******');
            processRabbitResponse(msg);
        }, ENV.RABBIT_QUEUES.WUBI_API_QUEUE_RESPONSE);
        console.log('🐇 RabbitMQ consumers initialized');
    } catch (error) {
        console.error('Failed to initialize RabbitMQ consumers:', error);
        throw error;
    }
}