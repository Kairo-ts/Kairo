import { VersionManager } from "../../utils/versionManager";
export class AddonActivator {
    constructor(addonManager) {
        this.addonManager = addonManager;
    }
    static create(addonManager) {
        return new AddonActivator(addonManager);
    }
    activateAddons(addons) {
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
    initAddonData(name, selectedVersion, versions) {
        const sortedVersions = versions.sort((a, b) => VersionManager.compare(b, a));
        const addonData = {
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
    registerAddonData(addon) {
        const addonData = this.addonManager.getAddonsData().get(addon.name);
        if (!addonData)
            return;
        const version = VersionManager.toVersionString(addon.version);
        addonData.versions[version] = {
            isRegistered: true,
            sessionId: addon.sessionId,
            tags: addon.tags,
            dependencies: addon.dependencies,
            requiredAddons: addon.requiredAddons
        };
    }
    activateLatestVersion(name) {
        const addonData = this.addonManager.getAddonsData().get(name);
        if (!addonData)
            return;
        const sorted = Object.keys(addonData.versions)
            .filter(v => addonData.versions[v]?.isRegistered)
            .sort((a, b) => VersionManager.compare(b, a));
        if (sorted.length === 0)
            return;
        const stable = sorted.find(v => !VersionManager.fromString(v).prerelease);
        addonData.activeVersion = stable ?? sorted[0];
        addonData.isActive = true;
    }
    activateSelectedVersion(name) {
        const addonData = this.addonManager.getAddonsData().get(name);
        if (!addonData)
            return;
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
