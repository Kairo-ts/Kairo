import { system, WorldLoadAfterEvent } from "@minecraft/server";
import { ConsoleManager } from "../../../utils/ConsoleManager";
import type { AddonInitializer } from "./AddonInitializer";
import { ScoreboardManager } from "../../../utils/ScoreboardManager";
import { SCRIPT_EVENT_IDS } from "../../constants";

/**
 * ルーターが各アドオンに登録要求を送るためのクラス
 * 各アドオンが AddonInitializeReceive を準備しておく必要があります
 * 
 * A class that sends registration requests from the router to each addon
 * Each addon must prepare AddonInitializeReceive
 */
export class AddonInitializeRequest {
    private constructor(private readonly addonInitializer: AddonInitializer) {}

    public static create(addonInitializer: AddonInitializer): AddonInitializeRequest {
        return new AddonInitializeRequest(addonInitializer);
    }

    public handleWorldLoad = (ev: WorldLoadAfterEvent): void => {
        this.sendRequest();
    }

    private sendRequest(): void {
        /**
         * アドオンの数を数えるためのscoreboardを用意しておく
         * Prepare a scoreboard to count the number of addons
         */
        ScoreboardManager.ensureObjective("AddonCounter").setScore("AddonCounter", 0);

        /**
         * scriptEventを送信して、各アドオンに登録要求を送る
         * Send a scriptEvent to request registration from each addon
         */
        ConsoleManager.log("World loaded. Sending core initialization request...");
        system.sendScriptEvent(SCRIPT_EVENT_IDS.BEHAVIOR_INITIALIZE_REQUEST, "");
    }
}