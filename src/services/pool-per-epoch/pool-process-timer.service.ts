import { eventHub } from "@services/events/event-hub";
import { EventName } from "@interfaces/events";
import { updatePoolPerEpochById, getPoolPerEpochById } from "@services/pool-per-epoch/queries";
import { RewardSystemManager } from "@services/solana/reward-system/reward-system.manager";
import { PoolPerEpoch } from "@interfaces/pool-per-epoch";
import { poolMessageTracker } from "@services/pool-per-epoch/pool-messages-tracker.service";
import { poolPerEpochInstance } from "./pool-per-epoch-instance.service";

export class PoolProcessTimer {
    private processData: {
        totalWubiNFNodes: number;
        totalWupiNFNodes: number;
        epochId: number;
        startTime: string;
    } | null = null;

    constructor() {
        this.setupEventListeners();
    }

    private setupEventListeners() {
        eventHub.on(EventName.REWARDS_PROCESS_STARTED, async (data) => {
            const startTime = new Date().toISOString();
            this.processData = {
                ...data,
                startTime
            };

            // update the pool per epoch with initial processing metrics
            const initialMetrics = {
                epochId: data.epochId,
                totalWubiNFNodes: data.totalWubiNFNodes,
                totalWupiNFNodes: data.totalWupiNFNodes,
                startTime,
                processingTimeMs: 0,
                processingTimeFormatted: '0h 0m 0s',
                status: 'started'  // we could add this field for tracking
            };

            await updatePoolPerEpochById(this.processData.epochId, {
                processing_metrics: initialMetrics
            });

            console.log('🔔 Rewards process started', {
                ...this.processData,
                metrics: initialMetrics
            });
        });

        eventHub.on(EventName.WUBI_PROCESS_COMPLETED, async () => {
            if (!this.processData) return;
            await this.handleProcessCompletion('wubi');
        });

        eventHub.on(EventName.WUPI_PROCESS_COMPLETED, async () => {
            if (!this.processData) return;
            await this.handleProcessCompletion('wupi');
        });
    }

    private async handleProcessCompletion(type: 'wubi' | 'wupi') {
        if (!this.processData) return;

        const pool = await getPoolPerEpochById(this.processData.epochId);
        if (!pool) return;

        const processingTime = this.calculateProcessingTime(pool);
        const totalNodes = type === 'wubi'
            ? this.processData.totalWubiNFNodes
            : this.processData.totalWupiNFNodes;

        console.log(`🔔 ${type.toUpperCase()} process completed`, {
            epochId: this.processData.epochId,
            totalNFNodes: totalNodes,
            processingTimeMs: processingTime,
            processingTimeFormatted: this.formatTime(processingTime),
            startTime: pool.processing_metrics?.startTime || this.processData.startTime,
            endTime: new Date().toISOString(),
            averageTimePerNode: totalNodes > 0
                ? `${(processingTime / totalNodes).toFixed(2)}ms per node`
                : 'N/A'
        });

        // update the pool per epoch with the processing metrics
        const updatedPool = await updatePoolPerEpochById(this.processData.epochId, {
            [`${type}_processing_status`]: 'messages_processed',
            [`${type}_messages_received`]: totalNodes,
        });
        if (!updatedPool) return;

        await this.checkCompletion(updatedPool);
    }

    private async checkCompletion(pool: PoolPerEpoch) {
        const bothCompleted =
            pool.wubi_processing_status === 'messages_processed' &&
            pool.wupi_processing_status === 'messages_processed';
        const totalNodes = pool.wubi_nfnodes_total + pool.wupi_nfnodes_total;

        if (bothCompleted && this.processData) {
            const totalTime = this.calculateProcessingTime(pool);
            const result = {
                epochId: pool.id,
                totalWubiNFNodes: pool.wubi_nfnodes_total,
                totalWupiNFNodes: pool.wupi_nfnodes_total,
                processingTimeMs: totalTime,
                processingTimeFormatted: this.formatTime(totalTime),
                startTime: pool.processing_metrics?.startTime || this.processData.startTime,
                endTime: new Date().toISOString(),
                averageTimePerNode: totalNodes > 0
                    ? `${(totalTime / totalNodes).toFixed(2)}ms per node`
                    : 'N/A',
                status: 'completed'
            };

            console.log('🔔 All processes completed', result);
            await updatePoolPerEpochById(pool.id, {
                processing_metrics: result,
                is_retrying: pool?.is_retrying ? false : pool?.is_retrying,
                regenerate_rewards_status: pool?.regenerate_rewards_status === "regenerating_rewards" ? "rewards_regenerated" : pool?.regenerate_rewards_status
            });
            // Clean up the reward system manager
            RewardSystemManager.cleanup();
            poolMessageTracker.clearCache(pool.id.toString());
            poolPerEpochInstance.clearAllInstances();

            this.resetProcess();
        }
    }

    private calculateProcessingTime(pool: PoolPerEpoch): number {
        // Try to get startTime from the pool first
        const poolStartTime = pool.processing_metrics?.startTime as string;

        // If it doesn't exist in the pool, use the state
        const startTimeToUse = poolStartTime || this.processData?.startTime;

        if (!startTimeToUse) {
            console.warn(`No start time found for pool ${pool.id}, using current time`);
            return 0;
        }

        return Date.now() - new Date(startTimeToUse).getTime();
    }

    private formatTime(ms: number): string {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    }

    private resetProcess() {
        this.processData = null;
    }
}