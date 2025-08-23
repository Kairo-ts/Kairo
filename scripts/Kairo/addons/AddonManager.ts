import type { Kairo } from "..";
import type { AddonProperty } from "./AddonPropertyManager";
import { AddonActivator } from "./AddonActivator";
import type { AddonRecords } from "./record/AddonRecord";
import { ScriptEventCommandMessageAfterEvent, system, type Player } from "@minecraft/server";
import { AddonList } from "./ui/AddonList";
import { AddonReceiver } from "./AddonReceiver";

export interface AddonData {
    name: string;
    description: [string, string];
    isActive: boolean;
    selectedVersion: string;
    activeVersion: string;
    versions: {
        [version: string]: {
            isRegistered: boolean;
            sessionId?: string;
            tags?: string[];
            dependencies?: {
                module_name: string;
                version: string;
            }[];
            requiredAddons?: {
                [name: string]: number[];
            };
        }
    }
}

export class AddonManager {
    private readonly activator: AddonActivator;
    private readonly receiver: AddonReceiver;
    private readonly addonList: AddonList;
    private readonly addonsData: Map<string, AddonData> = new Map();

    private constructor(private readonly kairo: Kairo) {
        this.activator = AddonActivator.create(this);
        this.receiver = AddonReceiver.create(this); 
        this.addonList = AddonList.create(this);
    }
    public static create(kairo: Kairo): AddonManager {
        return new AddonManager(kairo);
    }

    public activateAddons(addons: AddonProperty[]): void {
        this.activator.activateAddons(addons);
    }

    public getAddonsData(): Map<string, AddonData> {
        return this.addonsData;
    }

    public getAddonRecords(): AddonRecords {
        return this.kairo.getAddonRecords();
    }

    public showAddonList(player: Player): void {
        this.addonList.showAddonList(player);
    }

    public getSelfAddonProperty(): AddonProperty {
        return this.kairo.getSelfAddonProperty();
    }

    public subscribeReceiverHooks(): void {
        system.afterEvents.scriptEventReceive.subscribe(this.receiver.handleScriptEvent);
    }

    public activeAddon(): void {
        this.kairo.activeAddon();
    }

    public inactiveAddon(): void {
        this.kairo.inactiveAddon();
    }

    public sendActiveRequest(sessionId: string): void {
        this.activator.sendActiveRequest(sessionId);
    }

    public sendInactiveRequest(sessionId: string): void {
        this.activator.sendInactiveRequest(sessionId);
    }

    public handleAddonListScriptEvent = (ev: ScriptEventCommandMessageAfterEvent): void => {
        this.addonList.handleScriptEvent(ev);
    }
}