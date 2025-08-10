import { system, world, type ScriptEventCommandMessageAfterEvent } from "@minecraft/server";
import type { AddonProperty } from "../../AddonPropertyManager";
import type { AddonRouter } from "../../AddonRouter";
import { SCRIPT_EVENT_IDS } from "../../constants";

/**
 * BehaviorInitializeRequestの要求に対して、BehaviorInitializeResponseで応答したアドオンを
 * 登録するために一時的に保存しておくためのクラス
 * 
 * A class for temporarily storing addons that responded with BehaviorInitializeResponse
 * to a BehaviorInitializeRequest, in order to register them later.
 */
export class BehaviorInitializePending {
    private readonly pendingAddons: Map<string, AddonProperty> = new Map();

    private _resolveReady: (() => void) | null = null;
    public readonly ready: Promise<void> = new Promise(resolve => {
        this._resolveReady = resolve;
    });

    private constructor(private readonly addonRouter: AddonRouter) {}
    public static create(addonRouter: AddonRouter): BehaviorInitializePending {
        return new BehaviorInitializePending(addonRouter);
    }

    public handleScriptEventReceive = (ev: ScriptEventCommandMessageAfterEvent): void => {
        const { id, message } = ev;

        if (id !== SCRIPT_EVENT_IDS.BEHAVIOR_INITIALIZE_RESPONSE) return;
        this.add(message);

        const addonCount: number = world.scoreboard.getObjective("AddonCounter")?.getScore("AddonCounter") ?? 0;
        if (addonCount === this.pendingAddons.size) {
            this._resolveReady?.();
            this._resolveReady = null;
            world.scoreboard.removeObjective("AddonCounter");
        }
    }

    private add(message: string): void {
        const [addonProperties, registrationNum]: [AddonProperty, number] = JSON.parse(message);

        /**
         * Idが重複している場合は、再度IDを要求する
         * If the ID is duplicated, request a new ID again
         */
        if (this.pendingAddons.has(addonProperties.sessionId)) {
            system.sendScriptEvent(SCRIPT_EVENT_IDS.REQUEST_RESEED_SESSION_ID, registrationNum.toString());
            return;
        }
        this.pendingAddons.set(addonProperties.sessionId, addonProperties);
    }

    public has(sessionId: string): boolean {
        return this.pendingAddons.has(sessionId);
    }

    public get(sessionId: string): AddonProperty {
        return this.pendingAddons.get(sessionId) as AddonProperty;
    }

    public getAll(): AddonProperty[] {
        return Array.from(this.pendingAddons.values());
    }
}