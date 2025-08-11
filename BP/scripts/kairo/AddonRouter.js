import { system, world } from "@minecraft/server";
import { BehaviorInitializeActivator } from "./router/init/behaviorInitializeActivator";
import { BehaviorInitializeReceive } from "./router/init/behaviorInitializeReceive";
import { BehaviorInitializeRegister } from "./router/init/behaviorInitializeRegister";
import { BehaviorInitializeRequest } from "./router/init/behaviorInitializeRequest";
import { BehaviorInitializeResponse } from "./router/init/behaviorInitializeResponse";
import { AddonRecord } from "./router/record/AddonRecord";
/**
 * Werewolf-AddonRouterの中枢となるクラス
 * The core class of Werewolf-AddonRouter
 */
export class AddonRouter {
    constructor(kairo) {
        this.kairo = kairo;
        this.registrationNum = 0;
        this.activator = BehaviorInitializeActivator.create(this);
        this.receive = BehaviorInitializeReceive.create(this);
        this.register = BehaviorInitializeRegister.create(this);
        this.request = BehaviorInitializeRequest.create(this);
        this.response = BehaviorInitializeResponse.create(this);
        this.record = AddonRecord.create(this);
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
        system.afterEvents.scriptEventReceive.subscribe(this.register.handleScriptEventReceive);
    }
    unsubscribeCoreHooks() {
        world.afterEvents.worldLoad.unsubscribe(this.request.handleWorldLoad);
        system.afterEvents.scriptEventReceive.unsubscribe(this.register.handleScriptEventReceive);
    }
    getAllPendingAddons() {
        return this.register.getAll();
    }
    awaitRegistration() {
        return this.register.ready;
    }
    saveAddons(addons) {
        this.record.saveAddons(addons);
    }
    activateAddons(addons) {
        this.activator.activateAddons(addons);
    }
}
