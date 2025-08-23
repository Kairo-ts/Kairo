import { system, world } from "@minecraft/server";
import { AddonInitializeReceive } from "./AddonInitializeReceive";
import { AddonInitializeRegister } from "./AddonInitializeRegister";
import { AddonInitializeRequest } from "./AddonInitializeRequest";
import { AddonInitializeResponse } from "./AddonInitializeResponse";
import { AddonRecord } from "../record/AddonRecord";
export class AddonInitializer {
    constructor(kairo) {
        this.kairo = kairo;
        this.registrationNum = 0;
        this.receive = AddonInitializeReceive.create(this);
        this.register = AddonInitializeRegister.create(this);
        this.request = AddonInitializeRequest.create(this);
        this.response = AddonInitializeResponse.create(this);
        this.record = AddonRecord.create(this);
    }
    static create(kairo) {
        return new AddonInitializer(kairo);
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
    saveAddons() {
        this.record.saveAddons(this.register.getAll());
    }
    getAddonRecords() {
        return this.record.loadAddons();
    }
    getRegisteredAddons() {
        return this.register.getAll();
    }
    subscribeReceiverHooks() {
        this.kairo.subscribeReceiverHooks();
    }
}
