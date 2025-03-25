import { ConsumeMessage, Channel } from 'amqplib';
import * as amqp from 'amqp-connection-manager';
import { ChannelWrapper, AmqpConnectionManager } from 'amqp-connection-manager';
import { v4 as uuidv4 } from 'uuid';
import { MessageProcessor, QueueName, RabbitConfig } from '@interfaces/rabbitmq-wrapper';
import { QueueConfig } from '@interfaces/rabbitmq-wrapper';
import { ENV } from '@config/env/env';

class RabbitWrapper {
    private channel!: ChannelWrapper;
    private connection!: AmqpConnectionManager;
    private responseQueue!: string;
    private readonly queues: QueueConfig[];
    private static instance: RabbitWrapper;

    private constructor() {
        this.queues = Object.values(QueueName).map(name => ({
            name,
            durable: true,
            asserted: false
        }));
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
            const { user, pass, host, responseQueue } = config;
            const connectionUrl = `amqp://${user}:${pass}@${host}`;

            this.connection = amqp.connect([connectionUrl]);
            this.channel = this.connection.createChannel({
                json: true,
                setup: async (channel: Channel) => {
                    // Assert all queues
                    await Promise.all([
                        ...this.queues.map(queue => 
                            channel.assertQueue(queue.name, { durable: queue.durable })
                        ),
                        channel.assertQueue(responseQueue, { durable: true })
                    ]);
                }
            });
            this.responseQueue = responseQueue;

            // Setup error handlers
            this.connection.on('connect', () => {
                console.log('Successfully connected to RabbitMQ');
            });

            this.connection.on('disconnect', (err) => {
                console.log('Disconnected from RabbitMQ', err);
            });

            await this.channel.waitForConnect();
            console.log('Channel ready');
        } catch (error) {
            console.error('Failed to connect to RabbitMQ:', error);
            throw error;
        }
    }

    public async sendMessage<T>(
        message: T,
        queue: QueueName,
        correlationId: string = uuidv4()
    ): Promise<boolean> {
        try {
            const queueConfig = this.queues.find(q => q.name === queue);
            if (!queueConfig) throw new Error(`Queue ${queue} not found`);

            await this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
                persistent: true,
                correlationId,
                replyTo: this.responseQueue,
            });

            return true;
        } catch (error) {
            console.error('Failed to send message:', error);
            return false;
        }
    }

    public async consumeResponse(processor: MessageProcessor, queueName: QueueName): Promise<void> {
        try {
            const queue = this.queues.find(q => q.name === queueName);
            if (!queue) throw new Error(`Queue ${queueName} not found`);

            await this.channel.addSetup(async (channel: Channel) => {
                // First we configure the prefetch
                await channel.prefetch(5);
                
                // Then we configure the consumer
                return channel.consume(
                    queueName,
                    msg => msg && this.processMessage(processor, msg),
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
            responseQueue: ENV.RABBIT_RESPONSE_QUEUE
        });
        console.log('RabbitMQ initialized');
    } catch (error) {
        console.error('Failed to initialize RabbitMQ:', error);
        throw error;
    }
};