import type { Kairo } from ".";

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
}