import { system, world, type ScriptEventCommandMessageAfterEvent } from "@minecraft/server";
import type { AddonProperty } from "../AddonProperty";

/**
 * BehaviorInitializeRequestの要求に対して、BehaviorInitializeResponseで応答したアドオンを
 * 登録するために一時的に保存しておくためのクラス
 * 
 * A class for temporarily storing addons that responded with BehaviorInitializeResponse
 * to a BehaviorInitializeRequest, in order to register them later.
 */
export class BehaviorInitializePending {
    private static readonly pendingAddons: Map<string, AddonProperty> = new Map();

    private static _resolveReady: (() => void) | null = null;
    static readonly ready: Promise<void> = new Promise(resolve => {
        this._resolveReady = resolve;
    });

    static handleScriptEventReceive(ev: ScriptEventCommandMessageAfterEvent): void {
        const { id, message } = ev;

        if (id !== "router:initializeResponse") return;
        this.add(message);

        const addonCount: number = world.scoreboard.getObjective("AddonCounter")?.getScore("AddonCounter") ?? 0;
        if (addonCount === this.pendingAddons.size) {
            this._resolveReady?.();
            this._resolveReady = null;
            world.scoreboard.removeObjective("AddonCounter");
        }
    }

    private static add(message: string): void {
        let addonProperties: AddonProperty = JSON.parse(message) as AddonProperty;

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

    static has(sessionId: string): boolean {
        return this.pendingAddons.has(sessionId);
    }

    static get(sessionId: string): AddonProperty {
        return this.pendingAddons.get(sessionId) as AddonProperty;
    }

    static getAll(): AddonProperty[] {
        return Array.from(this.pendingAddons.values());
    }
}