import { Player, ScriptEventCommandMessageAfterEvent, system } from "@minecraft/server";
import { Kairo } from "./Kairo/index";

async function main(): Promise<void> {
    Kairo.init(); // client
    Kairo.initRouter();

    await Kairo.awaitRegistration();
    Kairo.unsubscribeInitializeHooks();

    Kairo.initSaveAddons();
    Kairo.initActivateAddons();

    system.afterEvents.scriptEventReceive.subscribe((ev: ScriptEventCommandMessageAfterEvent) => {
        const { id, message, sourceEntity } = ev;

        if (sourceEntity?.typeId !== "minecraft:player") return;

        if (id === "kairo:addonList") {
            Kairo.showAddonList(sourceEntity as Player);
        }
    });
}

main();