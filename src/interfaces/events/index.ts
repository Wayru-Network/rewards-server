import { RewardPerEpochEntry } from "@interfaces/rewards-per-epoch";
import EventEmitter from "events";

export interface EventMap {
    'beforeAssignRewards': {
        type: 'last_item_wubi' | 'last_item_wupi';
        epochId: number;
    };
    'rewardsAssigned': {
        epochId: number;
        success: boolean;
    };
    'rewardsProcessStarted': {
        startTime: number;
        totalWubiNodes: number;
        totalWupiNodes: number;
        epochId: number;
    };
    'wubiProcessCompleted': {
        epochId: number;
    };
    'wupiProcessCompleted': {
        epochId: number;
    };
    'rewardsProcessCompleted': {
        epochId: number;
        totalTime: number;
        summary: {
            wubiTime: number;
            wupiTime: number;
            totalNodesProcessed: number;
        };
    };
    // ...others events
}

export class EventHub extends EventEmitter {
    emit<K extends keyof EventMap>(event: K, data: EventMap[K]): boolean {
        return super.emit(event, data);
    }

    on<K extends keyof EventMap>(
        event: K,
        listener: (data: EventMap[K]) => void
    ): this {
        return super.on(event, listener);
    }
}

export enum EventName {
    BEFORE_ASSIGN_REWARDS = 'beforeAssignRewards',
    LAST_REWARD_CREATED = 'lastRewardCreated',
    NETWORK_SCORE_CALCULATED = 'networkScoreCalculated',
    REWARDS_PROCESS_STARTED = 'rewardsProcessStarted',
    WUBI_PROCESS_COMPLETED = 'wubiProcessCompleted',
    WUPI_PROCESS_COMPLETED = 'wupiProcessCompleted',
    REWARDS_PROCESS_COMPLETED = 'rewardsProcessCompleted'
}

export interface EventMap {
    [EventName.BEFORE_ASSIGN_REWARDS]: {
        type: 'last_item_wubi' | 'last_item_wupi';
        epochId: number;
    };
    [EventName.LAST_REWARD_CREATED]: {
        epochId: number;
        type: RewardPerEpochEntry['type'];
    };
    [EventName.NETWORK_SCORE_CALCULATED]: {
        epochId: number;
        networkScore: number;
        type: RewardPerEpochEntry['type'];
    };
    [EventName.REWARDS_PROCESS_STARTED]: {
        startTime: number;
        totalWubiNodes: number;
        totalWupiNodes: number;
        epochId: number;
    };
}

declare global {
    namespace NodeJS {
        interface Global {
            eventHub: EventHub;
        }
    }
}