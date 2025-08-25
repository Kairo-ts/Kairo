import { system, world, type ScriptEventCommandMessageAfterEvent } from "@minecraft/server";
import type { AddonProperty } from "../AddonPropertyManager";
import type { AddonInitializer } from "./AddonInitializer";
import { ConsoleManager } from "../../../utils/ConsoleManager";
import { VersionManager } from "../../../utils/VersionManager";
import { SCOREBOARD_NAMES } from "../../../constants/scoreboard";
import { SCRIPT_EVENT_IDS } from "../../../constants/scriptevent";

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

    private constructor(private readonly addonInitializer: AddonInitializer) {}
    public static create(addonInitializer: AddonInitializer): AddonInitializeRegister {
        return new AddonInitializeRegister(addonInitializer);
    }

    public handleScriptEventReceive = (ev: ScriptEventCommandMessageAfterEvent): void => {
        const { id, message } = ev;

        if (id !== SCRIPT_EVENT_IDS.BEHAVIOR_INITIALIZE_RESPONSE) return;
        this.add(message);

        const addonCount: number = world.scoreboard.getObjective(SCOREBOARD_NAMES.ADDON_COUNTER)?.getScore(SCOREBOARD_NAMES.ADDON_COUNTER) ?? 0;
        if (addonCount === this.registeredAddons.size) {
            this._resolveReady?.();
            this._resolveReady = null;
            world.scoreboard.removeObjective(SCOREBOARD_NAMES.ADDON_COUNTER);
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
        this.addonInitializer.subscribeReceiverHooks();
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