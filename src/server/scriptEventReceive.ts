import { ScriptEventCommandMessageAfterEvent, system } from "@minecraft/server";

system.afterEvents.scriptEventReceive.subscribe((ev: ScriptEventCommandMessageAfterEvent) => {
    const { id, message } = ev;
});