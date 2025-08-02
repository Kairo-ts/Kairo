import fs from 'fs';
import path from 'path';
import { properties } from "./src/properties";

function resolve(value: any, context: any): any {
    if (typeof value === "string" && value === "header.version") {
        return context.header.version;
    }
    return value;
}

const resolvedModules = properties.modules.map((mod: any) => ({
    ...mod,
    version: resolve(mod.version, properties),
}));

const manifest = {
    format_version: 2,
    metadata: properties.metadata,
    header: properties.header,
    modules: resolvedModules,
    dependencies: properties.dependencies,
};

const outputPath = path.resolve("BP/manifest.json");
fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 4));