export class PlayerKairoData {
    constructor(manager, JoinOrder, initialStates) {
        this.manager = manager;
        this.JoinOrder = 0;
        this.JoinOrder = JoinOrder;
        this.kairoState = new Set(initialStates);
    }
    getJoinOrder() {
        return this.JoinOrder;
    }
    setJoinOrder(order) {
        this.JoinOrder = order;
    }
    addState(newState) {
        const validated = this.manager.validateOrThrow(newState);
        this.kairoState.add(validated);
    }
    removeState(state) {
        this.kairoState.delete(state);
    }
    hasState(state) {
        return this.kairoState.has(state);
    }
    getStates() {
        return [...this.kairoState];
    }
    clearStates() {
        this.kairoState.clear();
    }
}
