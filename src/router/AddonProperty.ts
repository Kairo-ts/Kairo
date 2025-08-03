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