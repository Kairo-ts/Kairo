var _a;
import { Player, ScriptEventCommandMessageAfterEvent, system } from "@minecraft/server";
import { AddonPropertyManager } from "./addons/AddonPropertyManager";
import { AddonInitializer } from "./addons/router/init/AddonInitializer";
import { AddonManager } from "./addons/AddonManager";
import { SCRIPT_EVENT_IDS } from "./constants/scriptevent";
export class Kairo {
    constructor() {
        this.initialized = false;
        this.addonManager = AddonManager.create(this);
        this.addonPropertyManager = AddonPropertyManager.create(this);
        this.addonInitializer = AddonInitializer.create(this);
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new _a();
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
        system.sendScriptEvent(SCRIPT_EVENT_IDS.UNSUBSCRIBE_INITIALIZE, "");
    }
    getDataVaultLastDataLoaded() {
        return this.addonManager.getDataVaultLastDataLoaded();
    }
    static initSaveAddons() {
        this.getInstance().addonInitializer.saveAddons();
    }
    static initActivateAddons() {
        const inst = this.getInstance();
        inst.addonInitializer.initActivateAddons(inst.addonInitializer.getRegisteredAddons());
    }
    getAddonsData() {
        return this.addonManager.getAddonsData();
    }
    getAddonRecords() {
        return this.addonInitializer.getAddonRecords();
    }
    static showAddonList(player) {
        this.getInstance().addonManager.showAddonList(player);
    }
    sendActiveRequest(sessionId) {
        this.addonManager.sendActiveRequest(sessionId);
    }
    sendDeactiveRequest(sessionId) {
        this.addonManager.sendDeactiveRequest(sessionId);
    }
    static handleAddonRouterScriptEvent(ev) {
        _a.getInstance().addonManager.handleAddonRouterScriptEvent(ev);
    }
    static handleAddonListScriptEvent(ev) {
        _a.getInstance().addonManager.handleAddonListScriptEvent(ev);
    }
    static set onActivate(val) {
        if (typeof val === "function")
            this._pushSorted(this._initHooks, val);
        else
            this._pushSorted(this._initHooks, val.run, val.options);
    }
    static set onDeactivate(val) {
        if (typeof val === "function")
            this._pushSorted(this._deinitHooks, val);
        else
            this._pushSorted(this._deinitHooks, val.run, val.options);
    }
    static set onScriptEvent(val) {
        if (typeof val === "function")
            this._pushSorted(this._seHooks, val);
        else
            this._pushSorted(this._seHooks, val.run, val.options);
    }
    static addActivate(fn, opt) {
        this._pushSorted(this._initHooks, fn, opt);
    }
    static addDeactivate(fn, opt) {
        this._pushSorted(this._deinitHooks, fn, opt);
    }
    static addScriptEvent(fn, opt) {
        this._pushSorted(this._seHooks, fn, opt);
    }
    _scriptEvent(data) {
        void _a._runScriptEvent(data);
    }
    _activateAddon() {
        void _a._runActivateHooks();
    }
    _deactivateAddon() {
        void _a._runDeactivateHooks();
    }
    static _pushSorted(arr, fn, opt) {
        arr.push({ fn, priority: opt?.priority ?? 0 });
        arr.sort((a, b) => b.priority - a.priority);
    }
    static async _runActivateHooks() {
        for (const { fn } of this._initHooks) {
            try {
                await fn();
            }
            catch (e) {
                system.run(() => console.warn(`[Kairo.onActivate] ${e instanceof Error ? (e.stack ?? e.message) : String(e)}`));
            }
        }
        this.getInstance().addonManager.setActiveState(true);
    }
    static async _runDeactivateHooks() {
        for (const { fn } of [...this._deinitHooks].reverse()) {
            try {
                await fn();
            }
            catch (e) {
                system.run(() => console.warn(`[Kairo.onDeactivate] ${e instanceof Error ? (e.stack ?? e.message) : String(e)}`));
            }
        }
        this.getInstance().addonManager.setActiveState(false);
    }
    static async _runScriptEvent(data) {
        for (const { fn } of this._seHooks) {
            try {
                await fn(data);
            }
            catch (e) {
                system.run(() => console.warn(`[Kairo.onScriptEvent] ${e instanceof Error ? (e.stack ?? e.message) : String(e)}`));
            }
        }
    }
    saveAddon(addonData) {
        this.addonInitializer.saveAddon(addonData);
    }
}
_a = Kairo;
Kairo._initHooks = [];
Kairo._deinitHooks = [];
Kairo._seHooks = [];
Kairo.dataVaultHandleOnScriptEvent = (data) => {
    _a.getInstance().addonManager.dataVaultHandleOnScriptEvent(data);
};
