import { AddonActivator } from "./AddonActivator";
import { system } from "@minecraft/server";
import { AddonList } from "./ui/AddonList";
import { AddonReceiver } from "./AddonReceiver";
export class AddonManager {
    constructor(kairo) {
        this.kairo = kairo;
        this.addonsData = new Map();
        this.activator = AddonActivator.create(this);
        this.receiver = AddonReceiver.create(this);
        this.addonList = AddonList.create(this);
    }
    static create(kairo) {
        return new AddonManager(kairo);
    }
    activateAddons(addons) {
        this.activator.activateAddons(addons);
    }
    getAddonsData() {
        return this.addonsData;
    }
    getAddonRecords() {
        return this.kairo.getAddonRecords();
    }
    showAddonList(player) {
        this.addonList.showAddonList(player);
    }
    getSelfAddonProperty() {
        return this.kairo.getSelfAddonProperty();
    }
    subscribeReceiverHooks() {
        system.afterEvents.scriptEventReceive.subscribe(this.receiver.handleScriptEvent);
    }
}
