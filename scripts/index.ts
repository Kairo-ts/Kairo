import { Player, ScriptEventCommandMessageAfterEvent, system } from "@minecraft/server";
import { Kairo } from "./Kairo/index";
import { DynamicPropertyStorage } from "./Kairo/addons/record/DynamicPropertyStorage";

async function main(): Promise<void> {
    /**
     * DynamicPropertyをすべてクリアするメソッド (開発用)
     * アンコメントで使用してください
     * A method to clear all DynamicProperties (for development use)
     * Use by uncommenting
     */
    // DynamicPropertyStorage.clear();

    Kairo.init(); // client
    Kairo.initRouter();

    await Kairo.awaitRegistration();
    Kairo.unsubscribeInitializeHooks();

    Kairo.initSaveAddons();
    Kairo.initActivateAddons();
}

main();