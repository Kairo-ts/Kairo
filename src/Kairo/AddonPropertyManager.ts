import type { Kairo } from ".";
import { properties } from "../properties";

export interface AddonProperty {
    name: string;
    sessionId: string;
    version: number[];
    dependencies: {
        module_name: string;
        version: string;
    }[];
    requiredAddons: {
        [name: string]: number[];
    };
}

export class AddonPropertyManager {
    private self: AddonProperty;
    private readonly charset = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'];

    private constructor(private readonly kairo: Kairo) {
        this.self = {
            name: properties.header.name,
            sessionId: this.generateRandomId(8),
            version: properties.header.version,
            dependencies: properties.dependencies,
            requiredAddons: properties.requiredAddons
        }
    }

    public static create(kairo: Kairo): AddonPropertyManager {
        return new AddonPropertyManager(kairo);
    }

    public getSelfAddonProperty(): AddonProperty {
        return this.self;
    }

    public refreshSessionId(): void {
        this.self.sessionId = this.generateRandomId(8);
    }

    private generateRandomId(length: number = 8): string {
        return Array.from({ length }, () => this.charset[Math.floor(Math.random() * this.charset.length)]).join('');
    }
}