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

    // いずれ初期化メソッドにまとめる
    system.afterEvents.scriptEventReceive.subscribe((ev: ScriptEventCommandMessageAfterEvent) => {
        const { id, message, sourceEntity } = ev;

        if (sourceEntity?.typeId !== "minecraft:player") return;

        if (id === "kairo:addonList") {
            Kairo.showAddonList(sourceEntity as Player);
        }
    });
}

main();