import type { ScriptEventCommandMessageAfterEvent } from "@minecraft/server";
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

    static handleScriptEventReceive(ev: ScriptEventCommandMessageAfterEvent): void {
        const { id, message } = ev;

        if (id !== "router:initializeResponse") return;
        this.add(message);
    }

    private static add(message: string): void {
        let addonProperties: AddonProperty = JSON.parse(message) as AddonProperty;
        this.pendingAddons.set(addonProperties.name, addonProperties);
    }

    static has(addonName: string): boolean {
        return this.pendingAddons.has(addonName);
    }

    static get(addonName: string): AddonProperty {
        return this.pendingAddons.get(addonName) as AddonProperty;
    }

    static getAll(): AddonProperty[] {
        return Array.from(this.pendingAddons.values());
    }
}