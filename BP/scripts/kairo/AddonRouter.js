import { ScriptEventCommandMessageAfterEvent, system, world, WorldLoadAfterEvent } from "@minecraft/server";
import { BehaviorInitializePending } from "./router/init/behaviorInitializePending";
import { BehaviorInitializeReceive } from "./router/init/behaviorInitializeReceive";
import { BehaviorInitializeRegister } from "./router/init/behaviorInitializeRegister";
import { BehaviorInitializeRequest } from "./router/init/behaviorInitializeRequest";
import { BehaviorInitializeResponse } from "./router/init/behaviorInitializeResponse";
/**
 * Werewolf-AddonRouterの中枢となるクラス
 * The core class of Werewolf-AddonRouter
 */
export class AddonRouter {
    constructor(kairo) {
        this.kairo = kairo;
        this.pending = BehaviorInitializePending.create(this);
        this.receive = BehaviorInitializeReceive.create(this);
        this.register = BehaviorInitializeRegister.create(this);
        this.request = BehaviorInitializeRequest.create(this);
        this.response = BehaviorInitializeResponse.create(this);
    }
    static create(kairo) {
        return new AddonRouter(kairo);
    }
    clientInitialize() {
        system.afterEvents.scriptEventReceive.subscribe((ev) => {
            this.receive.handleScriptEvent(ev);
        });
    }
    requestGetSelfAddonProperty() {
        return this.kairo.getSelfAddonProperty();
    }
    requestRefreshSessionId() {
        return this.kairo.refreshSessionId();
    }
    requestSendResponse() {
        const selfAddonProperty = this.requestGetSelfAddonProperty();
        this.response.sendResponse(selfAddonProperty);
    }
    /**
     * WolrdLoadとScriptEventReceiveに、BehaviorInitializeのハンドルを追加する
     * Add BehaviorInitialize handles to WorldLoad and ScriptEventReceive
     */
    initialize() {
        world.afterEvents.worldLoad.subscribe((ev) => {
            this.request.handleWorldLoad(ev);
        });
        system.afterEvents.scriptEventReceive.subscribe((ev) => {
            this.pending.handleScriptEventReceive(ev);
        });
    }
    requestGetAllPendingAddons() {
        return this.pending.getAll();
    }
    getPendingReady() {
        return this.pending.ready;
    }
    requestRegisterAddon() {
        this.register.registerAddon();
    }
}
