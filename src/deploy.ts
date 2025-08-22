import path from "path";
import os from "os";
import fs from "fs";
import fse from "fs-extra";
import { fileURLToPath } from "url";
import { writeManifest } from "./generate-manifest";
import { writePackIcon } from "./copy-pack_icon";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    return path.join(
        devBpRoot,
        uwp,
        "LocalState",
        "games",
        "com.mojang",
        "development_behavior_packs",
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

    const { manifest, versionString } = writeManifest(bpDir);

    writePackIcon(rootDir);

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
