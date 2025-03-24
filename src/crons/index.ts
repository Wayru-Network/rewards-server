import cron from 'node-cron';

export const initializeCronJobs = () => {
    cron.schedule('* * * * *', () => {
        console.log('Cron job executed every minute');
    });
    
    console.log('🕒 Cron jobs initialized');
};