import { system, world } from "@minecraft/server";
import { BehaviorInitializeRequest } from "./init/behaviorInitializeRequest";
import { BehaviorInitializePending } from "./init/behaviorInitializePending";
import type { Kairo } from "..";

/**
 * Werewolf-AddonRouterの中枢となるクラス
 * The core class of Werewolf-AddonRouter
 */
export class AddonRouter {
    private constructor(private readonly kairo: Kairo) {

    }

    public static create(kairo: Kairo): AddonRouter {
        return new AddonRouter(kairo);
    }

    /**
     * WolrdLoadとScriptEventReceiveに、BehaviorInitializeのハンドルを追加する
     * Add BehaviorInitialize handles to WorldLoad and ScriptEventReceive
     */
    public initialize() {
        world.afterEvents.worldLoad.subscribe((ev) => BehaviorInitializeRequest.handleWorldLoad(ev));
        system.afterEvents.scriptEventReceive.subscribe((ev) => BehaviorInitializePending.handleScriptEventReceive(ev));
    }
}