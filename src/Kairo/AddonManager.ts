import type { Kairo } from ".";
import { VersionManager } from "../utils/versionManager";
import type { AddonProperty } from "./AddonPropertyManager";

export interface AddonData {
    name: string;
    selectedVersion: string;
    versions: {
        [version: string]: {
            isAvailable: boolean;
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
    private readonly addonsData: Map<string, AddonData> = new Map();

    private constructor(private readonly kairo: Kairo) {}
    public static create(kairo: Kairo): AddonManager {
        return new AddonManager(kairo);
    }

    public activateAddons(addons: AddonProperty[]): void {
        const addonRecords = this.kairo.getAddonRecords();

        Object.entries(addonRecords).forEach(([name, record]) => {
            this.initAddonData(name, record.selectedVersion, record.versions);
        });

        addons.forEach(addon => {
            this.registerAddonData(addon);
        });

        // latestの場合は最新の安定板を有効化し、
        // それ以外は選択されたバージョンを
        // 選択されているものが読み込まれていなければ、latestに変更する
    }

    private initAddonData(name: string, selectedVersion: string, versions: string[]): void {
        const addonData: AddonData = {
            name,
            selectedVersion,
            versions: {}
        };
        versions.forEach(version => {
            addonData.versions[version] = {
                isAvailable: false
            };
        });
        this.addonsData.set(name, addonData);
    }

    private registerAddonData(addon: AddonProperty): void {
        const addonData = this.addonsData.get(addon.name);
        if (!addonData) return;

        addonData.versions[VersionManager.toVersionString(addon.version)] = {
            isAvailable: true,
            sessionId: addon.sessionId,
            tags: addon.tags,
            dependencies: addon.dependencies,
            requiredAddons: addon.requiredAddons
        };
    }
}