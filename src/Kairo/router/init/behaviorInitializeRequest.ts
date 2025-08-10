import { system, world, WorldLoadAfterEvent } from "@minecraft/server";
import { ConsoleManager } from "../../../utils/consoleManager";
import type { AddonRouter } from "../../AddonRouter";
import { ScoreboardManager } from "../../../utils/scoreboardManager";

/**
 * ルーターが各アドオンに登録要求を送るためのクラス
 * 各アドオンが BehaviorInitializeReceive を準備しておく必要があります
 * 
 * A class that sends registration requests from the router to each addon
 * Each addon must prepare BehaviorInitializeReceive
 */
export class BehaviorInitializeRequest {
    private constructor(private readonly addonRouter: AddonRouter) {}

    public static create(addonRouter: AddonRouter): BehaviorInitializeRequest {
        return new BehaviorInitializeRequest(addonRouter);
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
        system.sendScriptEvent("kairo:initializeRequest", "");
    }
}