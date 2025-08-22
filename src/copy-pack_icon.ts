import path from "path";
import fs from "fs";
import fse from "fs-extra";

export function writePackIcon(rootDir: string) {
    const srcIcon = path.join(rootDir, "pack_icon.png");
    if (!fs.existsSync(srcIcon)) {
        throw new Error("pack_icon.png not found in root directory.");
    }

    const bpIcon = path.join(rootDir, "BP", "pack_icon.png");
    const rpIcon = path.join(rootDir, "RP", "pack_icon.png");
    const rpTexturesIcon = path.join(rootDir, "RP", "textures", "kairo", "pack_icon.png");

    [bpIcon, rpIcon, rpTexturesIcon].forEach(dst => {
        fse.ensureDirSync(path.dirname(dst));
        fse.copyFileSync(srcIcon, dst);
        console.log(`[pack_icon] copied to ${dst}`);
    });
}
