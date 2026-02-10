import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { pathToFileURL } from "url";

const UUID_STORE_FILE = ".uuid.json";

function getUUIDStorePath(rootDir) {
    return path.join(rootDir, "src", UUID_STORE_FILE);
}

function toVersionString(v) {
    let s = `${v.major}.${v.minor}.${v.patch}`;
    if (v.prerelease) s += `-${v.prerelease}`;
    if (v.build) s += `+${v.build}`;
    return s;
}

function toVersionTriple(v) {
    return [v.major, v.minor, v.patch];
}

function readJSONIfExists(filePath) {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function parseSemverParts(versionText) {
    const match = versionText.match(/(\d+)\.(\d+)\.(\d+)/);
    if (!match) return null;

    return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
}

function resolveInstalledKairoVersion(rootDir) {
    const installedPkgPath = path.join(
        rootDir,
        "node_modules",
        "@kairo-ts",
        "router",
        "package.json",
    );
    const installedPkg = readJSONIfExists(installedPkgPath);
    if (installedPkg?.version) {
        const parsed = parseSemverParts(installedPkg.version);
        if (parsed) return parsed;
    }

    const rootPkgPath = path.join(rootDir, "package.json");
    const rootPkg = readJSONIfExists(rootPkgPath) ?? {};
    const declaredVersion =
        rootPkg.dependencies?.["@kairo-ts/router"] ?? rootPkg.devDependencies?.["@kairo-ts/router"];

    if (typeof declaredVersion === "string") {
        const parsed = parseSemverParts(declaredVersion);
        if (parsed) return parsed;
    }

    return [0, 0, 0];
}

function loadOrCreateUUIDStore(rootDir) {
    const storePath = getUUIDStorePath(rootDir);
    const existing = readJSONIfExists(storePath) ?? {};

    const store = {
        bp: {
            header: existing.bp?.header ?? randomUUID(),
            module: existing.bp?.module ?? randomUUID(),
        },
        rp: {
            header: existing.rp?.header ?? randomUUID(),
        },
    };

    fs.mkdirSync(path.dirname(storePath), { recursive: true });
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2), "utf-8");

    return store;
}

function buildCommonManifestPart(props, kairoVersion) {
    return {
        metadata: {
            ...(props.metadata ?? {}),
            generated_with: {
                kairo: [kairoVersion.join(".")],
            },
        },
        header: {
            name: props.header.name,
            description: props.header.description,
            version: toVersionString(props.header.version),
            min_engine_version: props.header.min_engine_version,
        },
    };
}

function buildBPManifest(props, common, uuids) {
    const dependencies = [
        ...(props.dependencies ?? []),
        {
            uuid: uuids.rp.header,
            version: toVersionTriple(props.header.version),
        },
    ];

    return {
        format_version: 2,
        ...common,
        header: {
            ...common.header,
            uuid: uuids.bp.header,
        },
        modules: [
            {
                type: "script",
                language: "javascript",
                entry: "scripts/index.js",
                uuid: uuids.bp.module,
                version: toVersionTriple(props.header.version),
            },
        ],
        dependencies,
        capabilities: ["script_eval"],
    };
}

function buildRPManifest(props, common, uuids) {
    return {
        format_version: 2,
        ...common,
        header: {
            ...common.header,
            uuid: uuids.rp.header,
        },
        dependencies: [
            {
                uuid: uuids.bp.header,
                version: toVersionTriple(props.header.version),
            },
        ],
    };
}

export async function writeManifests(rootDir) {
    const propertiesPath = path.join(rootDir, "BP", "scripts", "properties.js");
    const { properties } = await import(pathToFileURL(propertiesPath).href);

    const kairoVersion = resolveInstalledKairoVersion(rootDir);
    const uuids = loadOrCreateUUIDStore(rootDir);
    const common = buildCommonManifestPart(properties, kairoVersion);

    const bpManifest = buildBPManifest(properties, common, uuids);
    const rpManifest = buildRPManifest(properties, common, uuids);
    const versionString = common.header.version;

    const bpDir = path.join(rootDir, "BP");
    const rpDir = path.join(rootDir, "RP");

    fs.mkdirSync(bpDir, { recursive: true });
    fs.writeFileSync(
        path.join(bpDir, "manifest.json"),
        JSON.stringify(bpManifest, null, 2),
        "utf-8",
    );

    fs.mkdirSync(rpDir, { recursive: true });
    fs.writeFileSync(
        path.join(rpDir, "manifest.json"),
        JSON.stringify(rpManifest, null, 2),
        "utf-8",
    );

    return { bpManifest, rpManifest, versionString, properties };
}
