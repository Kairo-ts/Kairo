import fs from "fs";
import path from "path";
import { properties } from "../scripts/properties";

export type Triple = [number, number, number];
export type SemVer = {
    major: number; minor: number; patch: number;
    prerelease?: string;
    build?: string;
};

export function toManifestTriple(v: SemVer): Triple {
    return [v.major, v.minor, v.patch];
}
export function toVersionString(v: SemVer): string {
    let s = `${v.major}.${v.minor}.${v.patch}`;
    if (v.prerelease) s += `-${v.prerelease}`;
    if (v.build) s += `+${v.build}`;
    return s;
}

export function resolveVersionRef(ref: any, headerSemver: SemVer): Triple {
    if (ref === "header.version") return toManifestTriple(headerSemver);
    if (Array.isArray(ref) && ref.length >= 3) return [ref[0], ref[1], ref[2]];
    if (typeof ref === "string" && /^\d+\.\d+\.\d+$/.test(ref)) {
        const [a, b, c] = ref.split(".").map(n => parseInt(n, 10));
        return [a, b, c];
    }
    return toManifestTriple(headerSemver);
}

// ---------- BP manifest ----------
export function buildBPManifest(props: any, rpUUID?: string) {
    const v: SemVer = props.header.version as SemVer;

    const header = {
        name: props.header.name,
        description: props.header.description,
        uuid: props.header.uuid,
        version: toManifestTriple(v),
        min_engine_version: props.header.min_engine_version as Triple,
    };

    const modules = (props.modules ?? []).map((m: any) => ({
        type: m.type,
        language: m.language,
        entry: m.entry,
        uuid: m.uuid,
        version: resolveVersionRef(m.version, v),
    }));

    const dependencies = props.dependencies ?? [];
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

// ---------- RP manifest ----------
export function buildRPManifest(props: any, bpHeader: any, bpUUID: string) {
    const v: SemVer = props.header.version as SemVer;

    const name =
        props.resourcepack.name === "Use BP Name"
            ? bpHeader.name
            : props.resourcepack.name;

    const description =
        props.resourcepack.description === "Use BP Description"
            ? bpHeader.description
            : props.resourcepack.description;

    const header = {
        name,
        description,
        uuid: props.resourcepack.uuid,
        version: toManifestTriple(v),
        min_engine_version: props.header.min_engine_version as Triple,
    };

    const modules = [
        {
            type: "resources",
            uuid: props.resourcepack.module_uuid,
            version: toManifestTriple(v),
        },
    ];

    return {
        manifest: {
            format_version: 2,
            header,
            modules,
            dependencies: [
                { uuid: bpUUID, version: toManifestTriple(v) },
            ],
        },
        versionString: toVersionString(v),
    };
}

// ---------- ファイル出力 ----------
export function writeManifests(rootDir: string) {
    const bpDir = path.join(rootDir, "BP");
    const rpDir = path.join(rootDir, "RP");

    const { manifest: rpManifest, versionString } = buildRPManifest(
        properties,
        properties.header,
        properties.header.uuid
    );
    const { manifest: bpManifest } = buildBPManifest(properties, rpManifest.header.uuid);

    fs.mkdirSync(bpDir, { recursive: true });
    fs.writeFileSync(
        path.join(bpDir, "manifest.json"),
        JSON.stringify(bpManifest, null, 2),
        "utf-8"
    );

    fs.mkdirSync(rpDir, { recursive: true });
    fs.writeFileSync(
        path.join(rpDir, "manifest.json"),
        JSON.stringify(rpManifest, null, 2),
        "utf-8"
    );

    return { bpManifest, rpManifest, versionString };
}
