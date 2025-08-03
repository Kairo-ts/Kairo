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
    private static self: AddonProperty;
    private static readonly charset = [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'];

    static setSelfAddonProperty(): void {
        this.self = {
            name: properties.header.name,
            sessionId: this.generateRandomId(8),
            version: properties.header.version,
            dependencies: properties.dependencies,
            requiredAddons: properties.requiredAddons
        }
    }
    
    static getSelfAddonProperty(): AddonProperty {
        return this.self;
    }

    static refreshSessionId(): void {
        this.self.sessionId = this.generateRandomId(8);
    }

    private static generateRandomId(length: number = 8): string {
        return Array.from({ length }, () => this.charset[Math.floor(Math.random() * this.charset.length)]).join('');
    }
}