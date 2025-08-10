import { system, world, WorldLoadAfterEvent } from "@minecraft/server";
import { ConsoleManager } from "../../../utils/consoleManager";
import { ScoreboardManager } from "../../../utils/scoreboardManager";
/**
 * ルーターが各アドオンに登録要求を送るためのクラス
 * 各アドオンが BehaviorInitializeReceive を準備しておく必要があります
 *
 * A class that sends registration requests from the router to each addon
 * Each addon must prepare BehaviorInitializeReceive
 */
export class BehaviorInitializeRequest {
    constructor(addonRouter) {
        this.addonRouter = addonRouter;
        this.handleWorldLoad = (ev) => {
            this.sendRequest();
        };
    }
    static create(addonRouter) {
        return new BehaviorInitializeRequest(addonRouter);
    }
    sendRequest() {
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
        system.sendScriptEvent("kairo:initializeRequest", "");
    }
}
