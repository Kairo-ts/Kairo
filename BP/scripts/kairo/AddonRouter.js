import { system, world } from "@minecraft/server";
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
        this.registrationNum = 0;
        this.pending = BehaviorInitializePending.create(this);
        this.receive = BehaviorInitializeReceive.create(this);
        this.register = BehaviorInitializeRegister.create(this);
        this.request = BehaviorInitializeRequest.create(this);
        this.response = BehaviorInitializeResponse.create(this);
    }
    static create(kairo) {
        return new AddonRouter(kairo);
    }
    subscribeClientHooks() {
        system.afterEvents.scriptEventReceive.subscribe(this.receive.handleScriptEvent);
    }
    unsubscribeClientHooks() {
        system.afterEvents.scriptEventReceive.unsubscribe(this.receive.handleScriptEvent);
    }
    getSelfAddonProperty() {
        return this.kairo.getSelfAddonProperty();
    }
    refreshSessionId() {
        return this.kairo.refreshSessionId();
    }
    sendResponse() {
        const selfAddonProperty = this.getSelfAddonProperty();
        this.response.sendResponse(selfAddonProperty);
    }
    setRegistrationNum(num) {
        this.registrationNum = num;
    }
    getRegistrationNum() {
        return this.registrationNum;
    }
    /**
     * WorldLoadとScriptEventReceiveに、BehaviorInitializeのハンドルを追加する
     * Add BehaviorInitialize handles to WorldLoad and ScriptEventReceive
     */
    subscribeCoreHooks() {
        world.afterEvents.worldLoad.subscribe(this.request.handleWorldLoad);
        system.afterEvents.scriptEventReceive.subscribe(this.pending.handleScriptEventReceive);
    }
    unsubscribeCoreHooks() {
        world.afterEvents.worldLoad.unsubscribe(this.request.handleWorldLoad);
        system.afterEvents.scriptEventReceive.unsubscribe(this.pending.handleScriptEventReceive);
    }
    getAllPendingAddons() {
        return this.pending.getAll();
    }
    getPendingReady() {
        return this.pending.ready;
    }
    registerAddon() {
        this.register.registerAddon();
    }
}
