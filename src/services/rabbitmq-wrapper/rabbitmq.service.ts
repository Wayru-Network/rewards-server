import { ConsumeMessage, Channel } from 'amqplib';
import * as amqp from 'amqp-connection-manager';
import { ChannelWrapper, AmqpConnectionManager } from 'amqp-connection-manager';
import { v4 as uuidv4 } from 'uuid';
import { MessageProcessor, RabbitConfig } from '@interfaces/rabbitmq-wrapper';
import { QueueConfig } from '@interfaces/rabbitmq-wrapper';
import { ENV } from '@config/env/env';
import { WUPIMessage, WUBIMessage } from '@interfaces/rewards-per-epoch';

class RabbitWrapper {
    private channel!: ChannelWrapper;
    private connection!: AmqpConnectionManager;
    private responseQueues!: {
        wubi: string;
        wupi: string;
    };
    private readonly queues: QueueConfig[] = [
        { name: ENV.RABBIT_QUEUES.WUBI_API_QUEUE, durable: true, asserted: false },
        { name: ENV.RABBIT_QUEUES.WUBI_API_QUEUE_RESPONSE, durable: true, asserted: false },
        { name: ENV.RABBIT_QUEUES.WUPI_API_QUEUE, durable: true, asserted: false },
        { name: ENV.RABBIT_QUEUES.WUPI_API_QUEUE_RESPONSE, durable: true, asserted: false }
    ];
    private static instance: RabbitWrapper;

    private constructor() {
        this.responseQueues = {
            wubi: ENV.RABBIT_QUEUES.WUBI_API_QUEUE_RESPONSE,
            wupi: ENV.RABBIT_QUEUES.WUPI_API_QUEUE_RESPONSE
        };
    }

    public static getInstance(): RabbitWrapper {
        if (!RabbitWrapper.instance) {
            RabbitWrapper.instance = new RabbitWrapper();
        }
        return RabbitWrapper.instance;
    }

    private async assertQueue(queue: QueueConfig): Promise<void> {
        if (!queue.asserted && this.channel) {
            await this.channel.assertQueue(queue.name, { durable: queue.durable });
            queue.asserted = true;
        }
    }

    private async processMessage(processor: MessageProcessor, msg: ConsumeMessage): Promise<void> {
        try {
            await processor(msg);
            this.channel?.ack(msg);
        } catch (error) {
            console.error('Error processing message:', error);
            this.channel?.nack(msg, false, true);
        }
    }

    public async connect(config: RabbitConfig): Promise<void> {
        try {
            const { user, pass, host, responseQueues } = config;
            const connectionUrl = `amqp://${user}:${pass}@${host}`;

            this.connection = amqp.connect([connectionUrl]);
            this.responseQueues = responseQueues;
            this.channel = this.connection.createChannel({
                json: false,
                setup: async (channel: Channel) => {
                    // Assert all queues
                    await Promise.all(
                        this.queues.map(queue => this.assertQueue(queue))
                    );
                }
            });

            // Setup error handlers
            this.connection.on('connect', () => {
                console.log('🔌 Successfully connected to RabbitMQ');
            });

            this.connection.on('disconnect', (err) => {
                console.log('🔌 Disconnected from RabbitMQ', err);
            }); 

            await this.channel.waitForConnect();
            console.log('🔌 Channel ready');
        } catch (error) {
            console.error('🚨 Failed to connect to RabbitMQ:', error);
            throw error;
        }
    }

    public async sendMessage<T extends WUPIMessage | WUBIMessage>(
        message: T,
        queue: keyof typeof this.responseQueues,
        correlationId: string = uuidv4()
    ): Promise<boolean> {
        try {
            const queueConfig = this.queues.find(q => q.name === queue);
            if (!queueConfig) throw new Error(`Queue ${queue} not found`);
            await this.assertQueue(queueConfig);
            await this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
                persistent: true,
                correlationId,
                replyTo: this.responseQueues[queue],
            });

            return true;
        } catch (error) {
            console.error('Failed to send message:', error);
            return false;
        }
    }

    public async consumeResponse(processor: MessageProcessor, queueName: string): Promise<void> {
        try {
            const queue = this.queues.find(q => q.name === queueName);
            if (!queue) throw new Error(`Queue ${queueName} not found`);

            await this.channel.addSetup(async (channel: Channel) => {
                // First we configure the prefetch
                await channel.prefetch(5);

                // Then we configure the consumer
                return channel.consume(
                    queueName,
                    async (msg) => {
                        if (msg) {
                            await this.processMessage(processor, msg);
                        }
                    },
                    {
                        noAck: false,
                    }
                );
            });
        } catch (error) {
            console.error('Error setting up consumer:', error);
            throw error;
        }
    }

    public async close(): Promise<void> {
        try {
            await this.channel?.close();
            await this.connection?.close();
        } catch (error) {
            console.error('Error closing RabbitMQ connection:', error);
        }
    }
}

export const rabbitWrapper = RabbitWrapper.getInstance();

export const initializeRabbitMQ = async () => {
    try {
        await rabbitWrapper.connect({
            user: ENV.RABBIT_USER,
            pass: ENV.RABBIT_PASS,
            host: ENV.RABBIT_HOST,
            responseQueues: {
                wubi: ENV.RABBIT_QUEUES.WUBI_API_QUEUE_RESPONSE,
                wupi: ENV.RABBIT_QUEUES.WUPI_API_QUEUE_RESPONSE
            }
        });
        console.log('🐇 RabbitMQ initialized');
    } catch (error) {
        console.error('Failed to initialize RabbitMQ:', error);
        throw error;
    }
};