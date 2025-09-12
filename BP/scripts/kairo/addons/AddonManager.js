import { AddonActivator } from "./router/AddonActivator";
import { ScriptEventCommandMessageAfterEvent, system } from "@minecraft/server";
import { AddonList } from "./ui/AddonList";
import { AddonReceiver } from "./router/AddonReceiver";
import { VersionManager } from "../../utils/VersionManager";
import { AddonRouter } from "./router/AddonRouter";
export class AddonManager {
    constructor(kairo) {
        this.kairo = kairo;
        this.addonsData = new Map();
        this.handleAddonRouterScriptEvent = (ev) => {
            this.addonRouter.handleScriptEvent(ev);
        };
        this.handleAddonListScriptEvent = (ev) => {
            this.addonList.handleScriptEvent(ev);
        };
        this.activator = AddonActivator.create(this);
        this.receiver = AddonReceiver.create(this);
        this.addonRouter = AddonRouter.create(this);
        this.addonList = AddonList.create(this);
    }
    static create(kairo) {
        return new AddonManager(kairo);
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
    _activateAddon() {
        this.kairo._activateAddon();
    }
    _deactivateAddon() {
        this.kairo._deactivateAddon();
    }
    _scriptEvent(message) {
        this.kairo._scriptEvent(message);
    }
    getLatestPreferStableVersion(id) {
        const addonData = this.getAddonsData().get(id);
        if (!addonData)
            return undefined;
        const sorted = Object.keys(addonData.versions)
            .filter(v => addonData.versions[v]?.isRegistered)
            .sort((a, b) => VersionManager.compare(b, a));
        if (sorted.length === 0) {
            return undefined;
        }
        const stable = sorted.find(v => !VersionManager.fromString(v).prerelease);
        return stable ?? sorted[0];
    }
    getLatestVersion(id) {
        const addonData = this.getAddonsData().get(id);
        if (!addonData)
            return undefined;
        const latestVersion = Object.keys(addonData.versions)
            .filter(v => addonData.versions[v]?.isRegistered)
            .sort((a, b) => VersionManager.compare(b, a))[0];
        return latestVersion ?? undefined;
    }
    sendActiveRequest(sessionId) {
        this.activator.sendActiveRequest(sessionId);
    }
    sendDeactiveRequest(sessionId) {
        this.activator.sendDeactiveRequest(sessionId);
    }
    activateAddon(player, addonData, version) {
        this.activator.activateAddon(player, addonData, version);
    }
    deactivateAddon(player, addonData) {
        this.activator.deactivateAddon(player, addonData);
    }
    saveAddon(addonData) {
        this.kairo.saveAddon(addonData);
    }
}
