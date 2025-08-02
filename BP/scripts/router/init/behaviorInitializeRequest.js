import { system, WorldLoadAfterEvent } from "@minecraft/server";
import { ConsoleManager } from "../../utils/consoleManager";
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
        ConsoleManager.log("World loaded. Sending core initialization request...");
        system.sendScriptEvent("router:initializeRequest", "");
    }
}
