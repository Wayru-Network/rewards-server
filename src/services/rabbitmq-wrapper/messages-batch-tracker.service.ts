export class MessageBatchTracker {
    private messageCount: Map<string, number> = new Map(); // epoch date -> count
    private expectedMessages: Map<string, number> = new Map(); // epoch date -> total expected
    private LOG_FREQUENCY = 25; // show log every 25 messages

    registerBatch(batchId: string, totalMessages: number) {
        if (this.hasBatch(batchId)) {
            console.log(`📝 Updating batchId: ${batchId} with new total: ${totalMessages} messages`);
        } else {
            console.log(`📝 Registering new batchId: ${batchId} with ${totalMessages} messages`);
        }

        this.messageCount.set(batchId, 0);
        this.expectedMessages.set(batchId, totalMessages);
    }

    trackMessage(batchId: string): { 
        isLastMessage: boolean; 
        progress: { 
            current: number; 
            total: number; 
            percentage: number 
        } 
    } {
        if (!this.hasBatch(batchId)) {
            console.error(`❌ Error: Attempting to track message for non-existent batchId: ${batchId}`);
            throw new Error(`BatchId: ${batchId} does not exist`);
        }

        const current = (this.messageCount.get(batchId) || 0) + 1;
        const expected = this.expectedMessages.get(batchId) || 0;
        
        this.messageCount.set(batchId, current);
        
        const isLastMessage = current === expected;
        const percentage = (current / expected) * 100;

        // only show log if:
        // - is multiple of LOG_FREQUENCY
        // - is the first message
        // - is the last message
        // - is the 50% of the progress
        if (current % this.LOG_FREQUENCY === 0 || 
            current === 1 || 
            isLastMessage || 
            (current === Math.floor(expected / 2))) {
            console.log(`📊 Progress for batchId: ${batchId} - ${current}/${expected} (${percentage.toFixed(2)}%)`);
        }

        if (isLastMessage) {
            console.log(`✅ Completed all messages for batchId: ${batchId}`);
            this.cleanBatch(batchId);
        }

        return {
            isLastMessage,
            progress: {
                current,
                total: expected,
                percentage
            }
        };
    }

    getBatchProgress(batchId: string) {
        const current = this.messageCount.get(batchId) || 0;
        const total = this.expectedMessages.get(batchId) || 0;
        return {
            current,
            total,
            percentage: total > 0 ? (current / total) * 100 : 0
        };
    }

    private hasBatch(batchId: string): boolean {
        return this.messageCount.has(batchId);
    }

    private cleanBatch(batchId: string) {
        this.messageCount.delete(batchId);
        this.expectedMessages.delete(batchId);
    }
}

export const messageBatchTracker = new MessageBatchTracker();