import { system, world } from "@minecraft/server";
import { BehaviorInitializeRegister } from "./init/behaviorInitializeRegister";
import { BehaviorInitializeRequest } from "./init/behaviorInitializeRequest";

export class AddonRouter {
    static initialize() {
        world.afterEvents.worldLoad.subscribe(BehaviorInitializeRequest.handleWorldLoad);
        system.afterEvents.scriptEventReceive.subscribe(BehaviorInitializeRegister.handleScriptEventReceive);
    }
}