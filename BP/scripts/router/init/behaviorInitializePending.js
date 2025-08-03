var _a;
import { world } from "@minecraft/server";
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
        this.pendingAddons.set(addonProperties.name, addonProperties);
    }
    static has(addonName) {
        return this.pendingAddons.has(addonName);
    }
    static get(addonName) {
        return this.pendingAddons.get(addonName);
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
