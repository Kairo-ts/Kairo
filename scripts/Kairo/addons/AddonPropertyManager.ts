import type { Kairo } from "..";
import { properties, type SemVer } from "../../properties";

export interface AddonProperty {
    id: string,
    name: string;
    description: string;
    sessionId: string;
    version: SemVer;
    dependencies: {
        module_name: string;
        version: string;
    }[];
    requiredAddons: {
        [name: string]: string;
    };
    tags: string[];
}

export class AddonPropertyManager {
    private self: AddonProperty;
    private readonly charset = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'];

    private constructor(private readonly kairo: Kairo) {
        this.self = {
            id: properties.id,
            name: properties.header.name,
            description: properties.header.description,
            sessionId: this.generateRandomId(8),
            version: properties.header.version,
            dependencies: properties.dependencies,
            requiredAddons: properties.requiredAddons,
            tags: properties.tags
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