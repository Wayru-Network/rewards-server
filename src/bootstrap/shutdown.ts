import { NetworkScoreCalculator } from "@services/pool-per-epoch/pool-network-score-calculator/network-score-calculator.service";
import { rabbitWrapper } from "@services/rabbitmq-wrapper/rabbitmq.service";

/**
 * Shutdown all services
 */
export const shutdown = async () => {
    try {
        console.log('Shutting down services...');
        // Add other services to close here
        await rabbitWrapper.close();
        // clean up the event listeners from the network score calculator
        if (NetworkScoreCalculator) {
            NetworkScoreCalculator.cleanup();
        }

        console.log('Services shut down successfully');
    } catch (error) {
        console.error('Error during shutdown:', error);
        throw error;
    }
}