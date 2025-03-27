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
    NETWORK_SCORE_CALCULATED = 'networkScoreCalculated'
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
}

declare global {
    namespace NodeJS {
        interface Global {
            eventHub: EventHub;
        }
    }
}