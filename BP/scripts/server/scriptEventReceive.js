import { ScriptEventCommandMessageAfterEvent, system } from "@minecraft/server";
system.afterEvents.scriptEventReceive.subscribe((ev) => {
    const { id, message } = ev;
});
