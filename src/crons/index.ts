import cron from 'node-cron';
import { initiateRewardsProcessing } from '@services/rewards-per-epoch/rabbit-rewards-messages/initiate-rewards-processing.service';
import { processRewardsAfterError } from '@services/rewards-per-epoch/rewards-per-epoch.service';

export const initializeCronJobs = () => {
    cron.schedule('0 0 * * *', () => {
        console.log('🚀 generating rewards 🚀')
        initiateRewardsProcessing()
    });
    // process rewards after error every 2 minutes
    cron.schedule('*/2 * * * *', () => {
        processRewardsAfterError()
    });


   
    console.log('🕒 Cron jobs initialized');
};