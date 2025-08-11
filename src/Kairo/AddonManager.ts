import type { Kairo } from ".";
import { VersionManager } from "../utils/versionManager";
import type { AddonProperty } from "./AddonPropertyManager";

export interface AddonData {
    name: string;
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

        this.addonsData.forEach((data, name) => {
            if (data.selectedVersion === "latest version") {
                this.activateLatestVersion(name);
            }
            else this.activateSelectedVersion(name);
        });
    }

    private initAddonData(name: string, selectedVersion: string, versions: string[]): void {
        const sortedVersions = versions.sort((a, b) => VersionManager.compare(b, a));

        const addonData: AddonData = {
            name,
            isActive: false,
            selectedVersion,
            activeVersion: "",
            versions: {}
        };
        sortedVersions.forEach(version => {
            addonData.versions[version] = {
                isRegistered: false
            };
        });
        this.addonsData.set(name, addonData);
    }

    private registerAddonData(addon: AddonProperty): void {
        const addonData = this.addonsData.get(addon.name);
        if (!addonData) return;

        addonData.versions[VersionManager.toVersionString(addon.version)] = {
            isRegistered: true,
            sessionId: addon.sessionId,
            tags: addon.tags,
            dependencies: addon.dependencies,
            requiredAddons: addon.requiredAddons
        };
    }

    private activateLatestVersion(name: string): void {
        const addonData = this.addonsData.get(name);
        if (!addonData) return;

        const sorted = Object.keys(addonData.versions)
            .filter(v => addonData.versions[v]?.isRegistered)
            .sort((a, b) => VersionManager.compare(b, a));

        if (sorted.length === 0) return;

        const stable = sorted.find(v => !VersionManager.fromString(v).prerelease);
        addonData.activeVersion = stable ?? sorted[0]!;
        addonData.isActive = true;
    }

    private activateSelectedVersion(name: string): void {
        const addonData = this.addonsData.get(name);
        if (!addonData) return;

        const selectedVersion = Object.keys(addonData.versions).find(v => v === addonData.selectedVersion);
        if (!selectedVersion) {
            addonData.selectedVersion = "latest version";
            this.activateLatestVersion(name);
            return;
        }

        addonData.activeVersion = selectedVersion;
        addonData.isActive = true;
    }
}