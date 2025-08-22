import { VersionManager } from "../../utils/versionManager";
import type { AddonData, AddonManager } from "./AddonManager";
import type { AddonProperty } from "./AddonPropertyManager";

export class AddonActivator {
    private constructor(private readonly addonManager: AddonManager) {}

    public static create(addonManager: AddonManager): AddonActivator {
        return new AddonActivator(addonManager);
    }

    public activateAddons(addons: AddonProperty[]): void {
        const addonRecords = this.addonManager.getAddonRecords();

        Object.entries(addonRecords).forEach(([name, record]) => {
            this.initAddonData(name, record.selectedVersion, record.versions);
        });

        addons.forEach(addon => {
            this.registerAddonData(addon);
        });

        this.addonManager.getAddonsData().forEach((data, name) => {
            this.activateSelectedVersion(name);
        });
    }

    private initAddonData(name: string, selectedVersion: string, versions: string[]): void {
        const sortedVersions = versions.sort((a, b) => VersionManager.compare(b, a));

        const addonData: AddonData = {
            name,
            description: ["0.0.0", ""],
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
        this.addonManager.getAddonsData().set(name, addonData);
    }

    private registerAddonData(addon: AddonProperty): void {
        const addonData = this.addonManager.getAddonsData().get(addon.name);
        if (!addonData) return;

        const version = VersionManager.toVersionString(addon.version);
        if (VersionManager.compare(addonData.description[0], version) === -1) {
            addonData.description[0] = version;
            addonData.description[1] = addon.description;
        }

        addonData.versions[version] = {
            isRegistered: true,
            sessionId: addon.sessionId,
            tags: addon.tags,
            dependencies: addon.dependencies,
            requiredAddons: addon.requiredAddons
        };
    }

    private activateLatestVersion(name: string): void {
        const addonData = this.addonManager.getAddonsData().get(name);
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
        const addonData = this.addonManager.getAddonsData().get(name);
        if (!addonData) return;

        if (addonData.selectedVersion === "latest version") {
            this.activateLatestVersion(name);
            return;
        }

        const selectedVersion = Object.keys(addonData.versions)
            .find(v => v === addonData.selectedVersion && addonData.versions[v]?.isRegistered);

        if (!selectedVersion) {
            addonData.selectedVersion = "latest version";
            this.activateLatestVersion(name);
            return;
        }

        addonData.activeVersion = selectedVersion;
        addonData.isActive = true;
    }
}