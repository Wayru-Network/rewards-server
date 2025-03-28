import { ConsumeMessage } from "amqplib";


export interface QueueConfig {
    name: string;
    durable: boolean;
    asserted: boolean;
}

export interface RabbitConfig {
    user: string;
    pass: string;
    host: string;
    responseQueues: {
        wubi: string;
        wupi: string;
    };
}

export interface WubiMessage {
    hotspot_score: number;
    wayru_device_id: string;
    epoch_id: number;
    last_item: boolean;
}

export interface WupiMessage {
    nas_id: string;
    nfnode_id: number;
    score: number;
    epoch: string;
    total_valid_nas: number;
}

export interface DeviceDataMessage {
    device_id: string;
    timestamp: string;
    os_version: string;
    os_services_version: string;
}

export type MessageProcessor = (msg: ConsumeMessage) => Promise<void>;