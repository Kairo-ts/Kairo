import { system, world } from "@minecraft/server";
import { BehaviorInitializeRequest } from "./init/behaviorInitializeRequest";
import { BehaviorInitializePending } from "./init/behaviorInitializePending";

/**
 * Werewolf-AddonRouterの中枢となるクラス
 * The core class of Werewolf-AddonRouter
 */
export class AddonRouter {
    /**
     * WolrdLoadとScriptEventReceiveに、BehaviorInitializeのハンドルを追加する
     * Add BehaviorInitialize handles to WorldLoad and ScriptEventReceive
     */
    static initialize() {
        world.afterEvents.worldLoad.subscribe((ev) => BehaviorInitializeRequest.handleWorldLoad(ev));
        system.afterEvents.scriptEventReceive.subscribe((ev) => BehaviorInitializePending.handleScriptEventReceive(ev));
    }
}