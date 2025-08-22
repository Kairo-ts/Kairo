import path from "path";
import os from "os";
import fs from "fs";
import fse from "fs-extra";
import { fileURLToPath } from "url";
import { writeManifests } from "./generate-manifest";
import { writePackIcon } from "./copy-pack_icon";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- UWP デプロイ先解決 ----------
function resolveMinecraftDevPath(addonName: string, type: "behavior" | "resource") {
    const userHome = os.homedir();
    const devRoot = path.join(userHome, "AppData", "Local", "Packages");
    if (!fs.existsSync(devRoot)) throw new Error("Packages folder not found.");

    const candidates = fs.readdirSync(devRoot)
        .filter((name: string) => name.startsWith("Microsoft.MinecraftUWP"))
        .map(name => ({ name, mtime: fs.statSync(path.join(devRoot, name)).mtimeMs }))
        .sort((a, b) => b.mtime - a.mtime);

    if (candidates.length === 0) throw new Error("Minecraft UWP folder not found.");

    const uwp = candidates[0].name;
    return path.join(
        devRoot,
        uwp,
        "LocalState",
        "games",
        "com.mojang",
        type === "behavior"
            ? "development_behavior_packs"
            : "development_resource_packs",
        addonName
    );
}

async function main() {
    if (process.platform !== "win32") {
        console.log("Not on Windows. Skipping copy.");
        return;
    }

    const rootDir = path.join(__dirname, "..");
    const bpDir = path.join(rootDir, "BP");
    const rpDir = path.join(rootDir, "RP");

    // BP/RP 両方の manifest.json を生成
    const { bpManifest, rpManifest, versionString } = writeManifests(rootDir);

    // pack_icon.png を BP/RP にコピー
    writePackIcon(rootDir);

    const bpName: string | undefined = bpManifest.header?.name;
    const rpName: string | undefined = rpManifest.header?.name;
    if (!bpName || !rpName) throw new Error("Addon name not found in manifest.");

    // UWP パス解決
    const dstBP = resolveMinecraftDevPath(bpName, "behavior");
    const dstRP = resolveMinecraftDevPath(rpName, "resource");

    // BP デプロイ
    fse.ensureDirSync(dstBP);
    fse.emptyDirSync(dstBP);
    fse.copySync(bpDir, dstBP, { overwrite: true });

    // RP デプロイ
    fse.ensureDirSync(dstRP);
    fse.emptyDirSync(dstRP);
    fse.copySync(rpDir, dstRP, { overwrite: true });

    console.log(`[deploy] BP => ${dstBP}`);
    console.log(`[deploy] RP => ${dstRP}`);
    console.log(`[deploy] ${bpName}/${rpName} ${versionString} deployed.`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
