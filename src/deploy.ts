// deploy.ts
import fs from "fs";
import path from "path";
import os from "os";
import fse from "fs-extra";
import { fileURLToPath } from "url";
import { properties } from "../scripts/properties";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Triple = [number, number, number];
type SemVer = {
    major: number; minor: number; patch: number;
    prerelease?: string; // "preview.3" | "beta.1" | "rc.1"
    build?: string;      // "abc123" など
};

function toManifestTriple(v: SemVer): Triple {
    return [v.major, v.minor, v.patch];
}
function toVersionString(v: SemVer): string {
    let s = `${v.major}.${v.minor}.${v.patch}`;
    if (v.prerelease) s += `-${v.prerelease}`;
    if (v.build) s += `+${v.build}`;
    return s;
}

function resolveVersionRef(ref: any, headerSemver: SemVer): Triple {
    if (ref === "header.version") return toManifestTriple(headerSemver);
    if (Array.isArray(ref) && ref.length >= 3) return [ref[0], ref[1], ref[2]];
    if (typeof ref === "string" && /^\d+\.\d+\.\d+$/.test(ref)) {
        const [a, b, c] = ref.split(".").map(n => parseInt(n, 10));
        return [a, b, c];
    }
    return toManifestTriple(headerSemver);
}   

// ---------- manifest 生成 ----------
function buildManifestFromProperties(props: any) {
    const v: SemVer = props.header.version as SemVer;

    const header = {
        name: props.header.name,
        description: props.header.description,
        uuid: props.header.uuid,
        version: toManifestTriple(v),
        min_engine_version: props.header.min_engine_version as Triple,
    };

    const modules = (props.modules ?? []).map((m: any) => {
        return {
            type: m.type,
            language: m.language,
            entry: m.entry,
            uuid: m.uuid,
            version: resolveVersionRef(m.version, v),
        };
    });

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

// ---------- UWP デプロイ ----------
function resolveMinecraftDevBpPath(addonName: string) {
    const userHome = os.homedir();
    const devBpRoot = path.join(userHome, "AppData", "Local", "Packages");
    if (!fs.existsSync(devBpRoot)) throw new Error("Packages folder not found.");

    const candidates = fs.readdirSync(devBpRoot)
        .filter((name: string) => name.startsWith("Microsoft.MinecraftUWP"))
        .map(name => ({ name, mtime: fs.statSync(path.join(devBpRoot, name)).mtimeMs }))
        .sort((a, b) => b.mtime - a.mtime);

    if (candidates.length === 0) throw new Error("Minecraft UWP folder not found.");

    const uwp = candidates[0].name;
    return path.join(devBpRoot, uwp, "LocalState", "games", "com.mojang", "development_behavior_packs", addonName);
}

async function main() {
    if (process.platform !== "win32") {
        console.log("Not on Windows. Skipping copy.");
        return;
    }

    const { manifest, versionString } = buildManifestFromProperties(properties);

    const bpDir = path.join(__dirname, "BP");
    const manifestPath = path.join(bpDir, "manifest.json");

    fse.ensureDirSync(bpDir);
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");

    const addonName: string | undefined = manifest.header?.name;
    if (!addonName) throw new Error("Addon name not found in manifest.");

    const dst = resolveMinecraftDevBpPath(addonName);

    fse.ensureDirSync(dst);
    fse.emptyDirSync(dst);
    fse.copySync(bpDir, dst, { overwrite: true });

    console.log(`[deploy] ${addonName} ${versionString} => ${dst}`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
