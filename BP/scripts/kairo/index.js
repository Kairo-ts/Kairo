import { system } from "@minecraft/server";
import { AddonPropertyManager } from "./addons/AddonPropertyManager";
import { AddonInitializer } from "./addons/init/AddonInitializer";
import { SCRIPT_EVENT_IDS } from "./constants";
import { AddonManager } from "./addons/AddonManager";
export class Kairo {
    constructor() {
        this.initialized = false;
        this.addonManager = AddonManager.create(this);
        this.addonPropertyManager = AddonPropertyManager.create(this);
        this.addonRouter = AddonInitializer.create(this);
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new Kairo();
        }
        return this.instance;
    }
    static init() {
        const inst = this.getInstance();
        if (inst.initialized)
            return;
        inst.initialized = true;
        inst.addonRouter.subscribeClientHooks();
    }
    static initRouter() {
        this.getInstance().addonRouter.subscribeCoreHooks();
    }
    getSelfAddonProperty() {
        return this.addonPropertyManager.getSelfAddonProperty();
    }
    refreshSessionId() {
        this.addonPropertyManager.refreshSessionId();
    }
    static awaitRegistration() {
        return this.getInstance().addonRouter.awaitRegistration();
    }
    static unsubscribeInitializeHooks() {
        this.getInstance().addonRouter.unsubscribeClientHooks();
        system.sendScriptEvent(SCRIPT_EVENT_IDS.UNSUBSCRIBE_INITIALIZE, "");
    }
    static initSaveAddons() {
        this.getInstance().addonRouter.saveAddons();
    }
    static initActivateAddons() {
        const inst = this.getInstance();
        inst.addonManager.activateAddons(inst.addonRouter.getRegisteredAddons());
    }
    getAddonRecords() {
        return this.addonRouter.getAddonRecords();
    }
}
