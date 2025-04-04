import { initializeRabbitMQ } from '@services/rabbitmq-wrapper/rabbitmq.service';
import { initializeRabbitConsumers } from '@services/rabbitmq-wrapper/rabbitmq-consumers.service';
import { startEventHub } from '@services/events/event-hub';
import { initializeCronJobs } from '@crons/index';
import { NetworkScoreCalculator } from '@services/pool-per-epoch/pool-network-score-calculator/network-score-calculator.service';
import { TimerService } from '@services/events/timer-service/timer.service';

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
        new NetworkScoreCalculator();
        new TimerService();

        //TODO: initialize other requires services here
        
        console.log('✈️  All services initialized successfully ');
    } catch (error) {
        console.error('🚨 Failed to initialize services:', error);
        throw error;
    }
}