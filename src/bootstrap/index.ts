import { initializeRabbitMQ } from '@services/rabbitmq-wrapper/rabbitmq.service';
import { initializeRabbitConsumers } from '@services/rabbitmq-wrapper/rabbitmq-customer.service';
import { startEventHub } from '@services/events/event-hub';
import { initializeCronJobs } from '@crons/index';


/**
 * Initialize all services
 */
export const bootstrap = async () => {
    try {
        console.log('🛫 Starting services initialization...');

        // Initialize services in sequence (or parallel if possible)
        await initializeRabbitMQ();
        startEventHub();
        initializeCronJobs();
        await initializeRabbitConsumers();
        //TODO: initialize other requires services here
        
        console.log('✈️  All services initialized successfully ');
    } catch (error) {
        console.error('🚨 Failed to initialize services:', error);
        throw error;
    }
}