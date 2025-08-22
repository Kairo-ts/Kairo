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

export function buildManifestFromProperties(props: any) {
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

    return {
        manifest: {
            format_version: 2,
            header,
            modules,
            dependencies: props.dependencies ?? [],
        },
        versionString: toVersionString(v),
    };
}

export function writeManifest(bpDir: string) {
    const { manifest, versionString } = buildManifestFromProperties(properties);
    const manifestPath = path.join(bpDir, "manifest.json");

    fs.mkdirSync(bpDir, { recursive: true });
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");

    return { manifest, versionString };
}
