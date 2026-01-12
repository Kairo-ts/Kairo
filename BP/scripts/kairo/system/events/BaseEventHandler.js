export class BaseEventHandler {
    constructor(eventManager) {
        this.eventManager = eventManager;
        this.isSubscribed = false;
        this.boundHandleBefore = undefined;
        this.boundHandleAfter = undefined;
    }
    subscribe() {
        if (this.isSubscribed)
            return;
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
    unsubscribe() {
        if (!this.isSubscribed)
            return;
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
