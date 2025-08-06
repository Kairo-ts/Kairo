var _a;
import { system, world } from "@minecraft/server";
/**
 * BehaviorInitializeRequestの要求に対して、BehaviorInitializeResponseで応答したアドオンを
 * 登録するために一時的に保存しておくためのクラス
 *
 * A class for temporarily storing addons that responded with BehaviorInitializeResponse
 * to a BehaviorInitializeRequest, in order to register them later.
 */
export class BehaviorInitializePending {
    static handleScriptEventReceive(ev) {
        const { id, message } = ev;
        if (id !== "router:initializeResponse")
            return;
        this.add(message);
        const addonCount = world.scoreboard.getObjective("AddonCounter")?.getScore("AddonCounter") ?? 0;
        if (addonCount === this.pendingAddons.size) {
            this._resolveReady?.();
            this._resolveReady = null;
            world.scoreboard.removeObjective("AddonCounter");
        }
    }
    static add(message) {
        let addonProperties = JSON.parse(message);
        /**
         * Idが重複している場合は、再度IDを要求する
         * If the ID is duplicated, request a new ID again
         */
        if (this.pendingAddons.has(addonProperties.sessionId)) {
            system.sendScriptEvent("router:requestReseedId", addonProperties.sessionId);
            return;
        }
        this.pendingAddons.set(addonProperties.sessionId, addonProperties);
    }
    static has(sessionId) {
        return this.pendingAddons.has(sessionId);
    }
    static get(sessionId) {
        return this.pendingAddons.get(sessionId);
    }
    static getAll() {
        return Array.from(this.pendingAddons.values());
    }
}
_a = BehaviorInitializePending;
BehaviorInitializePending.pendingAddons = new Map();
BehaviorInitializePending._resolveReady = null;
BehaviorInitializePending.ready = new Promise(resolve => {
    _a._resolveReady = resolve;
});
