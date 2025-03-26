import cron from 'node-cron';
import { initiateRewardsProcessing } from '@services/rewards-per-epoch/rabbit-rewards-messages/initiate-rewards-processing.service';

export const initializeCronJobs = () => {
    cron.schedule('* * * * *', () => {
        //initiateRewardsProcessing()
    });

   
    console.log('🕒 Cron jobs initialized');
};