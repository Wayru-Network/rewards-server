import cron from 'node-cron';
import { initiateRewardsProcessing } from '@services/rewards-per-epoch/rabbit-rewards-messages/initiate-rewards-processing.service';
import { processRewardsAfterError } from '@services/rewards-per-epoch/rewards-per-epoch.service';
import { changeRewardsStatusToReadyForClaim } from '@services/rewards-per-epoch/queries';
import { regenerateRewards } from '@services/pool-per-epoch/pool-per-epoch.service';

export const initializeCronJobs = () => {
    cron.schedule('0 0 * * *', () => {
        console.log('🚀 generating rewards 🚀')
        initiateRewardsProcessing()
    });
    // process rewards after error every 2 minutes
    cron.schedule('*/2 * * * *', () => {
        regenerateRewards()
        processRewardsAfterError()
    });
    // change to rewards status to ready-for-claim each tuesday at 6:PM utc
    cron.schedule('0 18 * * 2', () => {
        changeRewardsStatusToReadyForClaim()
    });
    console.log('🕒 Cron jobs initialized');
};