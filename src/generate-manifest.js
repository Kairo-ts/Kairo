import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const VERSION_STORE_FILE = ".manifest-version.json";

function toManifestTriple(v) {
    return [v.major, v.minor, v.patch];
}

function toVersionString(v) {
    let s = `${v.major}.${v.minor}.${v.patch}`;
    if (v.prerelease) s += `-${v.prerelease}`;
    if (v.build) s += `+${v.build}`;
    return s;
}

function compareVersion(a, b) {
    if (a.major !== b.major) return a.major - b.major;
    if (a.minor !== b.minor) return a.minor - b.minor;
    return a.patch - b.patch;
}

function incrementPatch(v) {
    return {
        major: v.major,
        minor: v.minor,
        patch: v.patch + 1,
    };
}

function loadStoredVersion(rootDir) {
    const p = path.join(rootDir, VERSION_STORE_FILE);
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, "utf-8")).version;
}

function saveStoredVersion(rootDir, version) {
    const p = path.join(rootDir, VERSION_STORE_FILE);
    fs.writeFileSync(p, JSON.stringify({ version }, null, 2), "utf-8");
}

function resolveVersionRef(ref, headerSemver) {
    if (ref === "header.version") return toManifestTriple(headerSemver);
    if (Array.isArray(ref) && ref.length >= 3) return [ref[0], ref[1], ref[2]];
    if (typeof ref === "string" && /^\d+\.\d+\.\d+$/.test(ref)) {
        return ref.split(".").map((n) => parseInt(n, 10));
    }
    return toManifestTriple(headerSemver);
}

function buildBPManifest(props, rpUUID) {
    const v = props.header.version;

    const header = {
        name: props.header.name,
        description: props.header.description,
        uuid: props.header.uuid,
        version: toManifestTriple(v),
        min_engine_version: props.header.min_engine_version,
    };

    const modules = (props.modules ?? []).map((m) => ({
        type: m.type,
        language: m.language,
        entry: m.entry,
        uuid: m.uuid,
        version: resolveVersionRef(m.version, v),
    }));

    const dependencies = [...(props.dependencies ?? [])];
    if (rpUUID) {
        dependencies.push({
            uuid: rpUUID,
            version: toManifestTriple(v),
        });
    }

    return {
        manifest: {
            format_version: 2,
            header,
            modules,
            dependencies,
        },
        versionString: toVersionString(v),
    };
}

function buildRPManifest(props, bpHeader, bpUUID) {
    const v = props.header.version;

    const name =
        props.resourcepack.name === "Use BP Name" ? bpHeader.name : props.resourcepack.name;

    const description =
        props.resourcepack.description === "Use BP Description"
            ? bpHeader.description
            : props.resourcepack.description;

    return {
        manifest: {
            format_version: 2,
            header: {
                name,
                description,
                uuid: props.resourcepack.uuid,
                version: toManifestTriple(v),
                min_engine_version: props.header.min_engine_version,
            },
            modules: [
                {
                    type: "resources",
                    uuid: props.resourcepack.module_uuid,
                    version: toManifestTriple(v),
                },
            ],
            dependencies: [{ uuid: bpUUID, version: toManifestTriple(v) }],
        },
        versionString: toVersionString(v),
    };
}

export async function writeManifests(rootDir) {
    const propertiesPath = path.join(rootDir, "BP", "scripts", "properties.js");
    const { properties } = await import(pathToFileURL(propertiesPath).href);

    const baseVersion = properties.header.version;
    const storedVersion = loadStoredVersion(rootDir);

    const effectiveBase =
        storedVersion && compareVersion(storedVersion, baseVersion) > 0
            ? storedVersion
            : baseVersion;

    const buildVersion = incrementPatch(effectiveBase);

    const buildProperties = {
        ...properties,
        header: {
            ...properties.header,
            version: buildVersion,
        },
    };

    const bpDir = path.join(rootDir, "BP");
    const rpDir = path.join(rootDir, "RP");

    let rpManifest = null;
    let bpManifest;
    let versionString;

    if (buildProperties.resourcepack) {
        const rpResult = buildRPManifest(
            buildProperties,
            buildProperties.header,
            buildProperties.header.uuid,
        );
        rpManifest = rpResult.manifest;
        versionString = rpResult.versionString;

        const bpResult = buildBPManifest(buildProperties, rpManifest.header.uuid);
        bpManifest = bpResult.manifest;

        fs.mkdirSync(rpDir, { recursive: true });
        fs.writeFileSync(
            path.join(rpDir, "manifest.json"),
            JSON.stringify(rpManifest, null, 2),
            "utf-8",
        );
    } else {
        const bpResult = buildBPManifest(buildProperties);
        bpManifest = bpResult.manifest;
        versionString = bpResult.versionString;
    }

    fs.mkdirSync(bpDir, { recursive: true });
    fs.writeFileSync(
        path.join(bpDir, "manifest.json"),
        JSON.stringify(bpManifest, null, 2),
        "utf-8",
    );

    saveStoredVersion(rootDir, buildVersion);

    return { bpManifest, rpManifest, versionString, properties };
}
