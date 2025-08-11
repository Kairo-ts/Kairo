import { system, world, type ScriptEventCommandMessageAfterEvent } from "@minecraft/server";
import type { AddonProperty } from "../../AddonPropertyManager";
import type { AddonRouter } from "../../AddonRouter";
import { SCRIPT_EVENT_IDS } from "../../constants";
import { ConsoleManager } from "../../../utils/consoleManager";
import { VersionManager } from "../../../utils/versionManager";

/**
 * 応答したアドオンを登録するためのクラス
 * 
 * A class responsible for registering addons that have responded.
 */
export class AddonInitializeRegister {
    private readonly registeredAddons: Map<string, AddonProperty> = new Map();

    private _resolveReady: (() => void) | null = null;
    public readonly ready: Promise<void> = new Promise(resolve => {
        this._resolveReady = resolve;
    });

    private constructor(private readonly addonRouter: AddonRouter) {}
    public static create(addonRouter: AddonRouter): AddonInitializeRegister {
        return new AddonInitializeRegister(addonRouter);
    }

    public handleScriptEventReceive = (ev: ScriptEventCommandMessageAfterEvent): void => {
        const { id, message } = ev;

        if (id !== SCRIPT_EVENT_IDS.BEHAVIOR_INITIALIZE_RESPONSE) return;
        this.add(message);

        const addonCount: number = world.scoreboard.getObjective("AddonCounter")?.getScore("AddonCounter") ?? 0;
        if (addonCount === this.registeredAddons.size) {
            this._resolveReady?.();
            this._resolveReady = null;
            world.scoreboard.removeObjective("AddonCounter");

            const registeredAddons = Array.from(this.registeredAddons.values());
        }
    }

    private add(message: string): void {
        const [addonProperties, registrationNum]: [AddonProperty, number] = JSON.parse(message);

        /**
         * Idが重複している場合は、再度IDを要求する
         * If the ID is duplicated, request a new ID again
         */
        if (this.registeredAddons.has(addonProperties.sessionId)) {
            system.sendScriptEvent(SCRIPT_EVENT_IDS.REQUEST_RESEED_SESSION_ID, registrationNum.toString());
            return;
        }
        ConsoleManager.log(`Registering addon: ${addonProperties.name} - ver.${VersionManager.toVersionString(addonProperties.version)}`);
        this.registeredAddons.set(addonProperties.sessionId, addonProperties);
    }

    public has(sessionId: string): boolean {
        return this.registeredAddons.has(sessionId);
    }

    public get(sessionId: string): AddonProperty {
        return this.registeredAddons.get(sessionId) as AddonProperty;
    }

    public getAll(): AddonProperty[] {
        return Array.from(this.registeredAddons.values());
    }
}