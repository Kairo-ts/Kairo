import { system, world } from "@minecraft/server";
import { SCRIPT_EVENT_IDS } from "../../constants";
import { ConsoleManager } from "../../../utils/consoleManager";
/**
 * 応答したアドオンを登録するためのクラス
 *
 * A class responsible for registering addons that have responded.
 */
export class BehaviorInitializeRegister {
    constructor(addonRouter) {
        this.addonRouter = addonRouter;
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
            const addonCount = world.scoreboard.getObjective("AddonCounter")?.getScore("AddonCounter") ?? 0;
            if (addonCount === this.registeredAddons.size) {
                this._resolveReady?.();
                this._resolveReady = null;
                world.scoreboard.removeObjective("AddonCounter");
            }
        };
    }
    static create(addonRouter) {
        return new BehaviorInitializeRegister(addonRouter);
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
        ConsoleManager.log(`Registering addon: ${addonProperties.name} - ver.${addonProperties.version.join(".")}`);
        this.registeredAddons.set(addonProperties.sessionId, addonProperties);
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
