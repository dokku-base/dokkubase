/**
 * Event system for Mock Dokku API
 * 
 * Implements type-safe event emitter with support for:
 * - System and application logs
 * - Metrics (CPU, memory, storage)
 * - Deployment status
 * - Server-Sent Events (SSE)
 * 
 * @module events
 */

import type { EventType, DokkuEvent, LogEvent, MetricsEvent, StatusEvent, DeploymentEvent } from './types';

type EventCallback = (event: DokkuEvent) => void;
type Unsubscribe = () => void;

interface Subscriber {
    callback: EventCallback;
    active: boolean;
}

class EventEmitter {
    private subscribers = new Map<string, Set<Subscriber>>();

    private getKey(type: EventType, appName: string): string {
        return `${type}:${appName}`;
    }

    emit<T extends DokkuEvent>(event: T): void {
        const key = this.getKey(event.type, event.appName);
        const appSubscribers = this.subscribers.get(key);
        
        if (appSubscribers) {
            const timestampedEvent = {
                ...event,
                timestamp: event.timestamp || Date.now()
            };
            
            // Filter inactive subscribers
            const inactiveSubscribers = new Set<Subscriber>();
            
            appSubscribers.forEach(subscriber => {
                try {
                    subscriber.callback(timestampedEvent);
                } catch (error) {
                    if (error instanceof TypeError && error.message.includes('Controller is already closed')) {
                        console.log(`Removing inactive subscriber for ${key}`);
                        subscriber.active = false;
                        inactiveSubscribers.add(subscriber);
                    } else {
                        console.error(`Error in event callback for ${key}:`, error);
                    }
                }
            });

            // Remove inactive subscribers
            inactiveSubscribers.forEach(sub => {
                appSubscribers.delete(sub);
            });

            // If no subscribers left, remove the key
            if (appSubscribers.size === 0) {
                this.subscribers.delete(key);
            }
        }
    }

    subscribe(type: EventType, appName: string, callback: EventCallback): Unsubscribe {
        const key = this.getKey(type, appName);
        
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, new Set());
        }
        
        const subscriber: Subscriber = {
            callback,
            active: true
        };
        
        const appSubscribers = this.subscribers.get(key)!;
        appSubscribers.add(subscriber);

        return () => {
            subscriber.active = false;
            appSubscribers.delete(subscriber);
            if (appSubscribers.size === 0) {
                this.subscribers.delete(key);
            }
        };
    }

    // Helper methods for type-safe event emission
    emitLog(event: Omit<LogEvent, 'timestamp'>): void {
        this.emit({ ...event, timestamp: Date.now() });
    }

    emitMetrics(event: Omit<MetricsEvent, 'timestamp'>): void {
        this.emit({ ...event, timestamp: Date.now() });
    }

    emitStatus(event: Omit<StatusEvent, 'timestamp'>): void {
        this.emit({ ...event, timestamp: Date.now() });
    }

    emitDeployment(event: Omit<DeploymentEvent, 'timestamp'>): void {
        this.emit({ ...event, timestamp: Date.now() });
    }
}

// Singleton instance
export const eventEmitter = new EventEmitter();

// Re-export types
export type { EventType, DokkuEvent, LogEvent, MetricsEvent, StatusEvent, DeploymentEvent };
