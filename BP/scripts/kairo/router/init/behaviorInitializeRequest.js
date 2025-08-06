import { system, world, WorldLoadAfterEvent } from "@minecraft/server";
import { ConsoleManager } from "../../../utils/consoleManager";
/**
 * ルーターが各アドオンに登録要求を送るためのクラス
 * 各アドオンが BehaviorInitializeReceive を準備しておく必要があります
 *
 * A class that sends registration requests from the router to each addon
 * Each addon must prepare BehaviorInitializeReceive
 */
export class BehaviorInitializeRequest {
    static handleWorldLoad(ev) {
        this.sendRequest();
    }
    static sendRequest() {
        /**
         * アドオンの数を数えるためのscoreboardを用意しておく
         * Prepare a scoreboard to count the number of addons
         */
        world.scoreboard.addObjective("AddonCounter").setScore("AddonCounter", 0);
        /**
         * scriptEventを送信して、各アドオンに登録要求を送る
         * Send a scriptEvent to request registration from each addon
         */
        ConsoleManager.log("World loaded. Sending core initialization request...");
        system.sendScriptEvent("router:initializeRequest", "");
    }
}
