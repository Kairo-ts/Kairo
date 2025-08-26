import { system } from "@minecraft/server";
import { VersionManager } from "../../../utils/VersionManager";
import { VERSION_KEYWORDS } from "../../../constants/version_keywords";
import { SCRIPT_EVENT_MESSAGES } from "../../../constants/scriptevent";
export class AddonActivator {
    constructor(addonManager) {
        this.addonManager = addonManager;
    }
    static create(addonManager) {
        return new AddonActivator(addonManager);
    }
    changeAddonSettings(addonData, version, isActive) {
        addonData.selectedVersion = version;
        addonData.isActive = isActive;
        const activeVersionData = addonData.versions[addonData.activeVersion];
        const sessionId = activeVersionData?.sessionId;
        if (!sessionId)
            return;
        if (addonData.isActive)
            this.sendActiveRequest(sessionId);
        else
            this.sendInactiveRequest(sessionId);
    }
    activateAddons(addons) {
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
                if (!sessionId)
                    return;
                this.sendActiveRequest(sessionId);
            }
        });
    }
    initAddonData(id, name, description, selectedVersion, versions) {
        const sortedVersions = versions.sort((a, b) => VersionManager.compare(b, a));
        const addonData = {
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
    registerAddonData(addon) {
        const addonData = this.addonManager.getAddonsData().get(addon.id);
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
    activateLatestVersion(id) {
        const addonData = this.addonManager.getAddonsData().get(id);
        if (!addonData)
            return;
        const sorted = Object.keys(addonData.versions)
            .filter(v => addonData.versions[v]?.isRegistered)
            .sort((a, b) => VersionManager.compare(b, a));
        if (sorted.length === 0) {
            addonData.activeVersion = VERSION_KEYWORDS.UNREGISTERED;
            return;
        }
        const stable = sorted.find(v => !VersionManager.fromString(v).prerelease);
        addonData.activeVersion = stable ?? sorted[0];
        addonData.isActive = true;
    }
    activateSelectedVersion(id) {
        const addonData = this.addonManager.getAddonsData().get(id);
        if (!addonData)
            return;
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
    sendActiveRequest(sessionId) {
        system.sendScriptEvent(`kairo:${sessionId}`, SCRIPT_EVENT_MESSAGES.ACTIVE_REQUEST);
    }
    sendInactiveRequest(sessionId) {
        system.sendScriptEvent(`kairo:${sessionId}`, SCRIPT_EVENT_MESSAGES.DEACTIVE_REQUEST);
    }
}
