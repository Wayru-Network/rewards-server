import { ConsumeMessage } from "amqplib";

// Enums and types
export enum QueueName {
    WIFI_API_QUEUE = 'wifi_api_queue'
}

export interface QueueConfig {
    name: QueueName;
    durable: boolean;
    asserted: boolean;
}

export interface RabbitConfig {
    user: string;
    pass: string;
    host: string;
    responseQueue: string;
}

export type MessageProcessor = (msg: ConsumeMessage) => Promise<void>;