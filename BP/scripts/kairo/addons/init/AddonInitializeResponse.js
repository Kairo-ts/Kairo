import { system, world } from "@minecraft/server";
import { SCRIPT_EVENT_IDS } from "../../constants";
/**
 * アドオンの properties を参照して、ルーターに応答するためのクラス
 * propertiesの必要な部分を抜粋して、JSON.stringifyで送信します
 *
 * A class that responds to the router by referencing the addon's properties
 * Extracts the necessary parts of the properties and sends them using JSON.stringify
 */
export class AddonInitializeResponse {
    constructor(addonInitializer) {
        this.addonInitializer = addonInitializer;
    }
    static create(addonInitializer) {
        return new AddonInitializeResponse(addonInitializer);
    }
    /**
     * scoreboard を使って登録用の識別番号も送信しておく
     * Also send the registration ID using the scoreboard
     */
    sendResponse(addonProperty) {
        system.sendScriptEvent(SCRIPT_EVENT_IDS.BEHAVIOR_INITIALIZE_RESPONSE, JSON.stringify([
            addonProperty,
            world.scoreboard.getObjective("AddonCounter")?.getScore("AddonCounter") ?? 0
        ]));
    }
}
