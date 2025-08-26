import { Player, system } from "@minecraft/server";
import { AddonPropertyManager, type AddonProperty } from "./addons/AddonPropertyManager";
import { AddonInitializer } from "./addons/router/init/AddonInitializer";
import { AddonManager } from "./addons/AddonManager";
import type { AddonRecords } from "./addons/record/AddonRecord";
import { SCRIPT_EVENT_IDS } from "../constants/scriptevent";

export class Kairo {
    private static instance: Kairo;
    private initialized = false;

    private readonly addonManager: AddonManager;
    private readonly addonPropertyManager: AddonPropertyManager;
    private readonly addonInitializer: AddonInitializer;

    private constructor() {
        this.addonManager = AddonManager.create(this);
        this.addonPropertyManager = AddonPropertyManager.create(this);
        this.addonInitializer = AddonInitializer.create(this);
    }

    public activeAddon(): void {
        /** 
         * ここに各アドオンの初期化処理を追加してください。 
         * 例えば、イベントのsubscribeなど
         * subscribeするメソッドは全て、unsubscribeできるようにし、inactiveAddon()にまとめてください。
         * 
         * Add the initialization process for each addon here.
         * For example, subscribing to events
         * Ensure that all subscribed methods can be unsubscribed, and group them into inactiveAddon()
         */

        system.afterEvents.scriptEventReceive.subscribe(this.addonManager.handleAddonListScriptEvent);
    }

    public inactiveAddon(): void {
        /**
         * アドオン無効化時に登録解除する処理などをまとめてください。
         * Consolidate processes such as unregistering when an addon is disabled
         */
        system.afterEvents.scriptEventReceive.unsubscribe(this.addonManager.handleAddonListScriptEvent);
    }

    private static getInstance(): Kairo {
        if (!this.instance) {
            this.instance = new Kairo();
        }
        return this.instance;
    }

    public static init(): void {
        const inst = this.getInstance();
        if (inst.initialized) return;

        inst.initialized = true;
        inst.addonInitializer.subscribeClientHooks();
    }

    public static initRouter(): void {
        this.getInstance().addonInitializer.subscribeCoreHooks();
    }

    public getSelfAddonProperty(): AddonProperty {
        return this.addonPropertyManager.getSelfAddonProperty();
    }

    public refreshSessionId(): void {
        this.addonPropertyManager.refreshSessionId();
    }

    public static awaitRegistration(): Promise<void> {
        return this.getInstance().addonInitializer.awaitRegistration();
    }

    public subscribeReceiverHooks(): void {
        this.addonManager.subscribeReceiverHooks();
    }

    public static unsubscribeInitializeHooks(): void {
        this.getInstance().addonInitializer.unsubscribeClientHooks();
        system.sendScriptEvent(SCRIPT_EVENT_IDS.UNSUBSCRIBE_INITIALIZE, "");
    }

    public static initSaveAddons(): void {
        this.getInstance().addonInitializer.saveAddons();
    }

    public static initActivateAddons(): void {
        const inst = this.getInstance();
        inst.addonManager.activateAddons(inst.addonInitializer.getRegisteredAddons());
    }

    public getAddonRecords(): AddonRecords {
        return this.addonInitializer.getAddonRecords();
    }

    public static showAddonList(player: Player): void {
        this.getInstance().addonManager.showAddonList(player);
    }
}