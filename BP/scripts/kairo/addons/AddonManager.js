import { AddonActivator } from "./router/AddonActivator";
import { ScriptEventCommandMessageAfterEvent, system } from "@minecraft/server";
import { AddonList } from "./ui/AddonList";
import { AddonReceiver } from "./router/AddonReceiver";
import { AddonRequireValidator } from "./router/AddonRequireValidator";
export class AddonManager {
    constructor(kairo) {
        this.kairo = kairo;
        this.addonsData = new Map();
        this.handleAddonListScriptEvent = (ev) => {
            this.addonList.handleScriptEvent(ev);
        };
        this.activator = AddonActivator.create(this);
        this.receiver = AddonReceiver.create(this);
        this.requireValidator = AddonRequireValidator.create(this);
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
    activeAddon() {
        this.kairo.activeAddon();
    }
    inactiveAddon() {
        this.kairo.inactiveAddon();
    }
    changeAddonSettings(addonData, version, isActive) {
        this.activator.changeAddonSettings(addonData, version, isActive);
    }
    async validateRequiredAddons(player, addonData, version, isActive) {
        this.requireValidator.validateRequiredAddons(player, addonData, version, isActive);
    }
}
