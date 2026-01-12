import type { BaseEventManager } from "./BaseEventManager";

export abstract class BaseEventHandler<
    TBefore = undefined,
    TAfter = undefined,
    TManager extends BaseEventManager = BaseEventManager,
> {
    protected isSubscribed = false;

    private boundHandleBefore: ((ev: TBefore) => void) | undefined = undefined;
    private boundHandleAfter: ((ev: TAfter) => void) | undefined = undefined;

    protected constructor(protected readonly eventManager: TManager) {}

    protected beforeEvent?:
        | {
              subscribe: (callback: (ev: TBefore) => void) => void;
              unsubscribe: (callback: (ev: TBefore) => void) => void;
          }
        | undefined;

    protected afterEvent?:
        | {
              subscribe: (callback: (ev: TAfter) => void) => void;
              unsubscribe: (callback: (ev: TAfter) => void) => void;
          }
        | undefined;

    protected handleBefore?(ev: TBefore): void;
    protected handleAfter?(ev: TAfter): void;

    public subscribe(): void {
        if (this.isSubscribed) return;

        if (this.beforeEvent && this.handleBefore) {
            this.boundHandleBefore = this.handleBefore.bind(this);
            this.beforeEvent.subscribe(this.boundHandleBefore);
        }

        if (this.afterEvent && this.handleAfter) {
            this.boundHandleAfter = this.handleAfter.bind(this);
            this.afterEvent.subscribe(this.boundHandleAfter);
        }

        this.isSubscribed = true;
    }

    public unsubscribe(): void {
        if (!this.isSubscribed) return;

        if (this.beforeEvent && this.boundHandleBefore) {
            this.beforeEvent.unsubscribe(this.boundHandleBefore);
            this.boundHandleBefore = undefined;
        }

        if (this.afterEvent && this.boundHandleAfter) {
            this.afterEvent.unsubscribe(this.boundHandleAfter);
            this.boundHandleAfter = undefined;
        }

        this.isSubscribed = false;
    }
}
