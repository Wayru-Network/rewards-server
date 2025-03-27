import { eventHub } from "@services/events/event-hub";
import { EventName } from "@interfaces/events";
import { updatePoolPerEpochById } from "@services/pool-per-epoch/queries";

export class TimerService {
    private processStartTime: number | null = null;
    private processData: {
        totalWubiNodes: number;
        totalWupiNodes: number;
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
                totalNodes: this.processData.totalWubiNodes,
                processingTimeMs: processingTime,
                processingTimeFormatted: this.formatTime(processingTime),
                startTime: new Date(this.processStartTime).toISOString(),
                endTime: new Date().toISOString(),
                averageTimePerNode: this.processData.totalWubiNodes > 0 
                    ? `${(processingTime / this.processData.totalWubiNodes).toFixed(2)}ms per node`
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
                totalNodes: this.processData.totalWupiNodes,
                processingTimeMs: processingTime,
                processingTimeFormatted: this.formatTime(processingTime),
                startTime: new Date(this.processStartTime).toISOString(),
                endTime: new Date().toISOString(),
                averageTimePerNode: this.processData.totalWupiNodes > 0 
                    ? `${(processingTime / this.processData.totalWupiNodes).toFixed(2)}ms per node`
                    : 'N/A'
            });

            this.checkCompletion();
        });
    }

    private checkCompletion() {
        if (this.wubiCompleted && this.wupiCompleted && this.processStartTime && this.processData) {
            const totalTime = Date.now() - this.processStartTime;
            const result = {
                epochId: this.processData.epochId,
                totalWubiNodes: this.processData.totalWubiNodes,
                totalWupiNodes: this.processData.totalWupiNodes,
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