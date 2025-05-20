import { Channel } from 'amqplib';
import * as amqp from 'amqp-connection-manager';
import { ChannelWrapper, AmqpConnectionManager } from 'amqp-connection-manager';
import { v4 as uuidv4 } from 'uuid';
import { MessageProcessor, RabbitConfig } from '@interfaces/rabbitmq-wrapper';
import { ENV } from '@config/env/env';
import { WUPIMessage, WUBIMessage } from '@interfaces/rewards-per-epoch';
import { processWubiRabbitResponse } from '@services/rewards-per-epoch/rabbit-rewards-consumers/process-wubi-response.service';
import { processWupiRabbitResponse } from '@services/rewards-per-epoch/rabbit-rewards-consumers/process-wupi-response.service';
import { rateLimiter } from '@services/rate-limiter/rate-limiter.service';

interface QueueChannel {
    name: string;
    replyTo: string;
    processor?: MessageProcessor;
    options?: {
        durable?: boolean;
        prefetch?: number;
        noAck?: boolean;
    };
}

class RabbitWrapper {
    private channel!: ChannelWrapper;
    private connection!: AmqpConnectionManager;
    private channels: Map<string, QueueChannel> = new Map();
    private static instance: RabbitWrapper;

    public static getInstance(): RabbitWrapper {
        if (!RabbitWrapper.instance) {
            RabbitWrapper.instance = new RabbitWrapper();
        }
        return RabbitWrapper.instance;
    }

    // Method to register a new channel
    public registerChannel(channel: QueueChannel): void {
        console.log(`📝 Registering channel: ${channel.name}`);
        this.channels.set(channel.name, {
            ...channel,
            options: {
                durable: true,
                prefetch: 5,
                noAck: false,
                ...channel.options
            }
        });
    }

    // Method to remove a channel
    public removeChannel(channelName: string): void {
        console.log(`🗑️ Removing channel: ${channelName}`);
        this.channels.delete(channelName);
    }

    public async connect(config: RabbitConfig): Promise<void> {
        try {
            const { user, pass, host } = config;
            const encodedVhost = encodeURIComponent('/develop');
            const connectionUrl = `amqp://${user}:${pass}@${host}/${encodedVhost}`;
            console.log('🔌 Attempting to connect to RabbitMQ with URL:', connectionUrl);

            this.connection = amqp.connect([connectionUrl], {
                heartbeatIntervalInSeconds: 5,
                reconnectTimeInSeconds: 5
            });

            this.channel = this.connection.createChannel({
                json: false,
                setup: async (channel: Channel) => {
                    console.log('📝 Setting up channel...');
                    // Configure all registered channels
                    for (const [_, queueChannel] of this.channels) {
                        await this.setupChannel(channel, queueChannel);
                    }
                }
            });

            this.connection.on('connect', () => console.log('✅ Successfully connected to RabbitMQ'));
            this.connection.on('disconnect', (err) => console.log('❌ Disconnected from RabbitMQ:', err));
            this.connection.on('error', (err) => console.log('🚨 RabbitMQ connection error:', err));

            await this.channel.waitForConnect();
            console.log('🔌 Channel ready');
        } catch (error) {
            console.error('🚨 Failed to connect to RabbitMQ:', error);
            throw error;
        }
    }

    private async setupChannel(channel: Channel, queueChannel: QueueChannel): Promise<void> {
        const { name, replyTo, options, processor } = queueChannel;

        // Ensure that the queues exist
        await channel.assertQueue(name, { durable: options?.durable });
        await channel.assertQueue(replyTo, { durable: options?.durable });

        // Configure the consumer if there is a processor
        if (processor) {
            await channel.prefetch(options?.prefetch || 5);
            await channel.consume(
                replyTo,
                async (msg) => {
                    if (msg) {
                        try {
                            await processor(msg);
                            channel.ack(msg);
                        } catch (error) {
                            console.error(`Error processing message in ${name}:`, error);
                            channel.nack(msg, false, true);
                        }
                    }
                },
                { noAck: options?.noAck }
            );
        }
    }

    public async sendMessage<T extends WUPIMessage | WUBIMessage>(
        message: T,
        queueName: string,
        correlationId: string = uuidv4()
    ): Promise<boolean> {
        try {
            const queueChannel = this.channels.get(queueName);
            if (!queueChannel) throw new Error(`Channel ${queueName} not found`);

            await this.channel.sendToQueue(
                queueName,
                Buffer.from(JSON.stringify(message)),
                {
                    persistent: true,
                    correlationId,
                    replyTo: queueChannel.replyTo,
                }
            );

            return true;
        } catch (error) {
            console.error('Failed to send message:', error);
            return false;
        }
    }

    public async consumeResponse(processor: MessageProcessor, queueName: string): Promise<void> {
        try {
            const queueChannel = this.channels.get(queueName);
            if (!queueChannel) throw new Error(`Channel ${queueName} not found`);

            // Update the processor of the channel
            this.channels.set(queueName, {
                ...queueChannel,
                processor
            });

            // Configure the consumer
            await this.channel.addSetup(async (channel: Channel) => {
                await channel.prefetch(queueChannel.options?.prefetch || 5);
                return channel.consume(
                    queueChannel.replyTo,
                    async (msg) => {
                        if (msg) {
                            try {
                                // Use rate limiter to process the message
                                await rateLimiter.execute(async () => {
                                    try {
                                        await processor(msg);
                                        channel.ack(msg);
                                    } catch (error) {
                                        console.error(`Error processing message in ${queueName}:`, error);
                                        channel.nack(msg, false, true);
                                    }
                                });
                            } catch (error) {
                                console.error(`Error processing message in ${queueName}:`, error);
                                channel.nack(msg, false, true);
                            }
                        }
                    },
                    { noAck: queueChannel.options?.noAck }
                );
            });

            console.log(`🎯 Consumer set up for ${queueName} -> ${queueChannel.replyTo}`);
        } catch (error) {
            console.error('Error setting up consumer:', error);
            throw error;
        }
    }

    /**
     * Close the connection with RabbitMQ in a clean way
        */
    public async close(): Promise<void> {
        try {
            console.log('🔌 Closing connection with RabbitMQ...');

            // Close the channel if it exists
            if (this.channel) {
                await this.channel.close();
                console.log('✅ Channel closed correctly');
            }

            // Close the connection if it exists
            if (this.connection) {
                await this.connection.close();
                console.log('✅ Connection closed correctly');
            }

            console.log('👋 Connection with RabbitMQ closed correctly');
        } catch (error) {
            console.error('❌ Error closing the connection with RabbitMQ:', error);
        }
    }
}

// Usage of the service
export const rabbitWrapper = RabbitWrapper.getInstance();

// Initialization
export const initializeRabbitMQ = async () => {
    try {
        // Register channels
        rabbitWrapper.registerChannel({
            name: ENV.RABBIT_QUEUES.WUBI_API_QUEUE,
            replyTo: ENV.RABBIT_QUEUES.WUBI_API_QUEUE_RESPONSE,
            processor: async (msg) => {
                try {
                    await processWubiRabbitResponse(msg);
                } catch (error) {
                    console.error('Error processing WUBI:', error);
                }
            },
            options: {
                durable: true,
                prefetch: 5,
                noAck: false
            }
        });

        rabbitWrapper.registerChannel({
            name: ENV.RABBIT_QUEUES.WUPI_API_QUEUE,
            replyTo: ENV.RABBIT_QUEUES.WUPI_API_QUEUE_RESPONSE,
            processor: async (msg) => {
                try {
                    await processWupiRabbitResponse(msg);
                } catch (error) {
                    console.error('Error processing WUPI 1:', error);
                }
            },
            options: {
                durable: true,
                prefetch: 5,
                noAck: false
            }
        });

        await rabbitWrapper.connect({
            user: ENV.RABBIT_USER,
            pass: ENV.RABBIT_PASS,
            host: ENV.RABBIT_HOST
        });

        console.log('🐇 RabbitMQ initialized');
    } catch (error) {
        console.error('Failed to initialize RabbitMQ:', error);
        throw error;
    }
};