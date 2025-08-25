import { system, world } from "@minecraft/server";
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
    constructor(addonInitializer) {
        this.addonInitializer = addonInitializer;
        this.registeredAddons = new Map();
        this._resolveReady = null;
        this.ready = new Promise(resolve => {
            this._resolveReady = resolve;
        });
        this.handleScriptEventReceive = (ev) => {
            const { id, message } = ev;
            if (id !== SCRIPT_EVENT_IDS.BEHAVIOR_INITIALIZE_RESPONSE)
                return;
            this.add(message);
            const addonCount = world.scoreboard.getObjective(SCOREBOARD_NAMES.ADDON_COUNTER)?.getScore(SCOREBOARD_NAMES.ADDON_COUNTER) ?? 0;
            if (addonCount === this.registeredAddons.size) {
                this._resolveReady?.();
                this._resolveReady = null;
                world.scoreboard.removeObjective(SCOREBOARD_NAMES.ADDON_COUNTER);
            }
        };
    }
    static create(addonInitializer) {
        return new AddonInitializeRegister(addonInitializer);
    }
    add(message) {
        const [addonProperties, registrationNum] = JSON.parse(message);
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
    has(sessionId) {
        return this.registeredAddons.has(sessionId);
    }
    get(sessionId) {
        return this.registeredAddons.get(sessionId);
    }
    getAll() {
        return Array.from(this.registeredAddons.values());
    }
}
