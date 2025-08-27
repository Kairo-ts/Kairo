import type { Kairo } from "..";
import type { AddonProperty } from "./AddonPropertyManager";
import { AddonActivator } from "./router/AddonActivator";
import type { AddonRecords } from "./record/AddonRecord";
import { ScriptEventCommandMessageAfterEvent, system, type Player } from "@minecraft/server";
import { AddonList } from "./ui/AddonList";
import { AddonReceiver } from "./router/AddonReceiver";
import { AddonRequireValidator } from "./router/AddonRequireValidator";
import { VersionManager } from "../../utils/VersionManager";

export type RegistrationState = "registered" | "unregistered" | "missing_requiredAddons";

export interface AddonData {
    id: string;
    name: string;
    description: [string, string];
    isActive: boolean;
    isEditable: boolean;
    selectedVersion: string;
    activeVersion: string;
    versions: {
        [version: string]: {
            isRegistered: boolean;
            registrationState: RegistrationState;
            isInitActivable?: boolean;
            sessionId?: string;
            tags?: string[];
            dependencies?: {
                module_name: string;
                version: string;
            }[];
            requiredAddons?: {
                [name: string]: string;
            };
        }
    }
}

export class AddonManager {
    private readonly activator: AddonActivator;
    private readonly receiver: AddonReceiver;
    private readonly requireValidator: AddonRequireValidator;
    private readonly addonList: AddonList;
    private readonly addonsData: Map<string, AddonData> = new Map();

    private constructor(private readonly kairo: Kairo) {
        this.activator = AddonActivator.create(this);
        this.receiver = AddonReceiver.create(this);
        this.requireValidator = AddonRequireValidator.create(this);
        this.addonList = AddonList.create(this);
    }
    public static create(kairo: Kairo): AddonManager {
        return new AddonManager(kairo);
    }

    public initActivateAddons(addons: AddonProperty[]): void {
        this.activator.initActivateAddons(addons);
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

    public changeAddonSettings(addonData: AddonData, version: string, isActive: boolean): void {
        this.activator.changeAddonSettings(addonData, version, isActive);
    }

    public handleAddonListScriptEvent = (ev: ScriptEventCommandMessageAfterEvent): void => {
        this.addonList.handleScriptEvent(ev);
    }

    public async validateRequiredAddons(player: Player, addonData: AddonData, version: string, isActive: boolean): Promise<void> {
        this.requireValidator.validateRequiredAddons(player, addonData, version, isActive);
    }

    public getLatestPreferStableVersion(id: string): string | undefined {
        const addonData = this.getAddonsData().get(id);
        if (!addonData) return undefined;

        const sorted = Object.keys(addonData.versions)
            .filter(v => addonData.versions[v]?.isRegistered)
            .sort((a, b) => VersionManager.compare(b, a));

        if (sorted.length === 0) {
            return undefined;
        }

        const stable = sorted.find(v => !VersionManager.fromString(v).prerelease);
        return stable ?? sorted[0]!;
    }

    public getLatestVersion(id: string): string | undefined {
        const addonData = this.getAddonsData().get(id);
        if (!addonData) return undefined;

        const latestVersion = Object.keys(addonData.versions)
            .filter(v => addonData.versions[v]?.isRegistered)
            .sort((a, b) => VersionManager.compare(b, a))[0];

        return latestVersion ?? undefined;
    }
}