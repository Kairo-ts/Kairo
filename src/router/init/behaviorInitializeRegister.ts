import { ConsoleManager } from "../../utils/consoleManager";

/**
 * 応答したアドオンを登録するためのクラス
 * 前提アドオンの有無などを調べて、追加するかどうかの判定もする
 * ※現在は応答を受け取る機能のみ実装
 * 
 * A class responsible for registering addons that have responded.
 * It checks for the presence of required addons and determines whether to add them.
 * *Currently, only the functionality for receiving responses is implemented.*
 */
export class BehaviorInitializeRegister {
    private static registerAddon(message: string): void {
        const addonProperties = JSON.parse(message);

        ConsoleManager.log(`registerd ${addonProperties.name} ver.${addonProperties.version.join(".")}`);
    }
}