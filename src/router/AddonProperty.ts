export interface AddonProperty {
    name: string;
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
    private static readonly charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    static generateRandomId(length: number = 8): string {
        const chars = this.charset.split('');
        return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    }
}