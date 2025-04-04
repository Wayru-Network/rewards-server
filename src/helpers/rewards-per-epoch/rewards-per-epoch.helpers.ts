import { ERROR_DELAY, MAX_RETRIES } from "@constants";
import { checkSync } from "@services/nas/nas.service";

// check if the wupi backend is ready to receive the messages
export const checkWupiSync = async (epochDate: string): Promise<boolean> => {
        try {
            const { ready } = await checkSync(epochDate);
            if (ready) return true;
            
            return false;
        } catch (error) {
            console.error(`Sync check attempt failed:`, error);
            return false;
        }
};

export const checkWubiSync = async (epochDate: string): Promise<boolean> => {
    try {
        return true; // for the moment we are not checking the wubi sync, because it's not ready yet
    } catch (error) {
        console.error(`Sync check attempt failed:`, error);
        return false;
    }
};
// log the progress of the rewards per epoch
export const logProgress = (processed: number, total: number, type: 'WUBI' | 'WUPI') => {
    const percentage = ((processed / total) * 100).toFixed(2);
    console.log(`${type} Progress: ${processed}/${total} (${percentage}%)`);
};

// with retry
export const withRetry = async <T>(
    operation: () => Promise<T>,
    retries = MAX_RETRIES
): Promise<T> => {
    try {
        return await operation();
    } catch (error) {
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, ERROR_DELAY));
            return withRetry(operation, retries - 1);
        }
        throw error;
    }
};

// process in chunks
export const processInChunks = <T>(items: T[], chunkSize: number): T[][] => {
    return Array.from({ length: Math.ceil(items.length / chunkSize) }, (_, i) =>
        items.slice(i * chunkSize, (i + 1) * chunkSize)
    );
};

