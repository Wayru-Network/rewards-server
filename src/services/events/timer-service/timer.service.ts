import { eventHub } from "@services/events/event-hub";
import { EventName } from "@interfaces/events";
import { updatePoolPerEpochById } from "@services/pool-per-epoch/queries";
import { RewardSystemManager } from "@services/solana/reward-system/reward-system.manager";

export class TimerService {
    private processStartTime: number | null = null;
    private processData: {
        totalWubiNFNodes: number;
        totalWupiNFNodes: number;
        epochId: number;
    } | null = null;
    private wubiCompleted = false;
    private wupiCompleted = false;

    constructor() {
        this.setupEventListeners();
    }

    private setupEventListeners() {
        eventHub.on(EventName.REWARDS_PROCESS_STARTED, (data) => {
            this.processStartTime = Date.now();
            this.processData = data;
            this.wubiCompleted = false;
            this.wupiCompleted = false;
            console.log('🔔 Rewards process started', {
                ...data,
                startTime: new Date(this.processStartTime).toISOString()
            });
        });

        eventHub.on(EventName.WUBI_PROCESS_COMPLETED, () => {
            if (!this.processStartTime || !this.processData) return;
            this.wubiCompleted = true;
            
            const processingTime = Date.now() - this.processStartTime;
            console.log('🔔 WUBI process completed', {
                epochId: this.processData.epochId,
                totalNFNodes: this.processData.totalWubiNFNodes,
                processingTimeMs: processingTime,
                processingTimeFormatted: this.formatTime(processingTime),
                startTime: new Date(this.processStartTime).toISOString(),
                endTime: new Date().toISOString(),
                averageTimePerNode: this.processData.totalWubiNFNodes > 0 
                    ? `${(processingTime / this.processData.totalWubiNFNodes).toFixed(2)}ms per node`
                    : 'N/A'
            });

            this.checkCompletion();
        });

        eventHub.on(EventName.WUPI_PROCESS_COMPLETED, () => {
            if (!this.processStartTime || !this.processData) return;
            this.wupiCompleted = true;
            
            const processingTime = Date.now() - this.processStartTime;
            console.log('🔔 WUPI process completed', {
                epochId: this.processData.epochId,
                totalNFNodes: this.processData.totalWupiNFNodes,
                processingTimeMs: processingTime,
                processingTimeFormatted: this.formatTime(processingTime),
                startTime: new Date(this.processStartTime).toISOString(),
                endTime: new Date().toISOString(),
                averageTimePerNode: this.processData.totalWupiNFNodes > 0 
                    ? `${(processingTime / this.processData.totalWupiNFNodes).toFixed(2)}ms per node`
                    : 'N/A'
            });

            this.checkCompletion();
            // clean up reward system manager
            RewardSystemManager.cleanup()
        });
    }

    private checkCompletion() {
        if (this.wubiCompleted && this.wupiCompleted && this.processStartTime && this.processData) {
            const totalTime = Date.now() - this.processStartTime;
            const result = {
                epochId: this.processData.epochId,
                totalWubiNFNodes: this.processData.totalWubiNFNodes,
                totalWupiNFNodes: this.processData.totalWupiNFNodes,
                processingTimeMs: totalTime,
                processingTimeFormatted: this.formatTime(totalTime),
                startTime: new Date(this.processStartTime).toISOString(),
                endTime: new Date().toISOString()
            }
            console.log('🔔 All processes completed', result);
            updatePoolPerEpochById(this.processData.epochId, {
                processing_metrics: result,
                status: 'ready-for-claim'
            });

            this.resetProcess();
        }
    }

    private formatTime(ms: number): string {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    }

    private resetProcess() {
        this.processStartTime = null;
        this.processData = null;
        this.wubiCompleted = false;
        this.wupiCompleted = false;
    }
}