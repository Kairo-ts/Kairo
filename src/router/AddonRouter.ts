import { system, world } from "@minecraft/server";
import { BehaviorInitializeRegister } from "./init/behaviorInitializeRegister";
import { BehaviorInitializeRequest } from "./init/behaviorInitializeRequest";

export class AddonRouter {
    static initialize() {
        world.afterEvents.worldLoad.subscribe((ev) => BehaviorInitializeRequest.handleWorldLoad(ev));
        system.afterEvents.scriptEventReceive.subscribe((ev) => BehaviorInitializeRegister.handleScriptEventReceive(ev));
    }
}