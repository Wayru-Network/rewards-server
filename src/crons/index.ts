import { generateRewardsPerEpoch } from '@services/rewards-per-epoch/rewards-per-epoch.service';
import cron from 'node-cron';

export const initializeCronJobs = () => {
    /// cron.schedule('* * * * *', () => {
    ///     console.log('Cron job executed every minute');
    /// });

    generateRewardsPerEpoch()
    console.log('🕒 Cron jobs initialized');
};