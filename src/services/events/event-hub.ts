import { EventMap } from '@interfaces/events';
import { EventEmitter } from 'events';

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

export const eventHub = new EventHub();

//make a global event listener for rewards per epoch ready for claim
export const startEventHub = () => {

    (global as unknown as {
        eventHub: EventHub;
    }).eventHub = eventHub as EventHub
    console.log('🔔 eventHub started')
}