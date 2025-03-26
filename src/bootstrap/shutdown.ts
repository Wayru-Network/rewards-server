import { rabbitWrapper } from "@services/rabbitmq-wrapper/rabbitmq.service";

/**
 * Shutdown all services
 */
export const shutdown = async () => {
    try {
        console.log('Shutting down services...');
        // Add other services to close here
        await rabbitWrapper.close();
        console.log('Services shut down successfully');
    } catch (error) {
        console.error('Error during shutdown:', error);
        throw error;
    }
}