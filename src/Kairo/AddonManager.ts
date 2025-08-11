import type { Kairo } from ".";
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

    public initAddonData(name: string, selectedVersion: string, versions: string[]): void {
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

    public registerAddonData(addon: AddonProperty): void {
        
    }
}