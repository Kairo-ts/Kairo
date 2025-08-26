import { system } from "@minecraft/server";
import { VersionManager } from "../../../utils/VersionManager";
import type { AddonData, AddonManager } from "../AddonManager";
import type { AddonProperty } from "../AddonPropertyManager";
import { VERSION_KEYWORDS } from "../../../constants/version_keywords";
import { SCRIPT_EVENT_MESSAGES } from "../../../constants/scriptevent";

export class AddonActivator {
    private constructor(private readonly addonManager: AddonManager) {}

    public static create(addonManager: AddonManager): AddonActivator {
        return new AddonActivator(addonManager);
    }

    public changeAddonSettings(addonData: AddonData, version: string, isActive: boolean): void {
        addonData.selectedVersion = version;
        addonData.isActive = isActive;

        const activeVersionData = addonData.versions[addonData.activeVersion];
        const sessionId = activeVersionData?.sessionId;
        if (!sessionId) return;

        if (addonData.isActive) this.sendActiveRequest(sessionId);
        else this.sendInactiveRequest(sessionId);
    }

    public initActivateAddons(addons: AddonProperty[]): void {
        const addonRecords = this.addonManager.getAddonRecords();

        Object.entries(addonRecords).forEach(([id, record]) => {
            this.initAddonData(id, record.name, record.description, record.selectedVersion, record.versions);
        });

        addons.forEach(addon => {
            this.registerAddonData(addon);
        });

        this.addonManager.getAddonsData().forEach((data, id) => {
            this.activateSelectedVersion(id);

            if (data.isActive) {
                const activeVersionData = data.versions[data.activeVersion];
                const sessionId = activeVersionData?.sessionId;
                if (!sessionId) return;
                this.sendActiveRequest(sessionId);
            }
        });
    }

    private initAddonData(id: string, name: string, description: [string, string], selectedVersion: string, versions: string[]): void {
        const sortedVersions = versions.sort((a, b) => VersionManager.compare(b, a));

        const addonData: AddonData = {
            id,
            name,
            description,
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
        this.addonManager.getAddonsData().set(id, addonData);
    }

    private registerAddonData(addon: AddonProperty): void {
        const addonData = this.addonManager.getAddonsData().get(addon.id);
        if (!addonData) return;

        const version = VersionManager.toVersionString(addon.version);
        addonData.versions[version] = {
            isRegistered: true,
            sessionId: addon.sessionId,
            tags: addon.tags,
            dependencies: addon.dependencies,
            requiredAddons: addon.requiredAddons
        };
    }

    private activateLatestVersion(id: string): void {
        const addonData = this.addonManager.getAddonsData().get(id);
        if (!addonData) return;

        const sorted = Object.keys(addonData.versions)
            .filter(v => addonData.versions[v]?.isRegistered)
            .sort((a, b) => VersionManager.compare(b, a));

        if (sorted.length === 0) {
            addonData.activeVersion = VERSION_KEYWORDS.UNREGISTERED;
            return;
        }

        const stable = sorted.find(v => !VersionManager.fromString(v).prerelease);
        addonData.activeVersion = stable ?? sorted[0]!;
        addonData.isActive = true;
    }

    private activateSelectedVersion(id: string): void {
        const addonData = this.addonManager.getAddonsData().get(id);
        if (!addonData) return;

        if (addonData.selectedVersion === VERSION_KEYWORDS.LATEST) {
            this.activateLatestVersion(id);
            return;
        }

        const selectedVersion = Object.keys(addonData.versions)
            .find(v => v === addonData.selectedVersion && addonData.versions[v]?.isRegistered);

        if (!selectedVersion) {
            addonData.selectedVersion = VERSION_KEYWORDS.LATEST;
            this.activateLatestVersion(id);
            return;
        }

        addonData.activeVersion = selectedVersion;
        addonData.isActive = true;
    }

    private sendActiveRequest(sessionId: string): void {
        system.sendScriptEvent(`kairo:${sessionId}`, SCRIPT_EVENT_MESSAGES.ACTIVE_REQUEST);
    }

    private sendInactiveRequest(sessionId: string): void {
        system.sendScriptEvent(`kairo:${sessionId}`, SCRIPT_EVENT_MESSAGES.DEACTIVE_REQUEST);
    }
}