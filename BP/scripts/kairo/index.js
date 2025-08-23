import { Player, system } from "@minecraft/server";
import { AddonPropertyManager } from "./addons/AddonPropertyManager";
import { AddonInitializer } from "./addons/init/AddonInitializer";
import { SCRIPT_EVENT_IDS } from "./constants";
import { AddonManager } from "./addons/AddonManager";
export class Kairo {
    constructor() {
        this.initialized = false;
        this.addonManager = AddonManager.create(this);
        this.addonPropertyManager = AddonPropertyManager.create(this);
        this.addonInitializer = AddonInitializer.create(this);
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
        inst.addonInitializer.subscribeClientHooks();
    }
    static initRouter() {
        this.getInstance().addonInitializer.subscribeCoreHooks();
    }
    getSelfAddonProperty() {
        return this.addonPropertyManager.getSelfAddonProperty();
    }
    refreshSessionId() {
        this.addonPropertyManager.refreshSessionId();
    }
    static awaitRegistration() {
        return this.getInstance().addonInitializer.awaitRegistration();
    }
    subscribeReceiverHooks() {
        this.addonManager.subscribeReceiverHooks();
    }
    static unsubscribeInitializeHooks() {
        this.getInstance().addonInitializer.unsubscribeClientHooks();
        system.sendScriptEvent(SCRIPT_EVENT_IDS.UNSUBSCRIBE_INITIALIZE, "");
    }
    static initSaveAddons() {
        this.getInstance().addonInitializer.saveAddons();
    }
    static initActivateAddons() {
        const inst = this.getInstance();
        inst.addonManager.activateAddons(inst.addonInitializer.getRegisteredAddons());
    }
    getAddonRecords() {
        return this.addonInitializer.getAddonRecords();
    }
    static showAddonList(player) {
        this.getInstance().addonManager.showAddonList(player);
    }
}
