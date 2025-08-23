import path from "path";
import fs from "fs";
import fse from "fs-extra";
import { properties } from "../scripts/properties";

export function writePackIcon(rootDir: string) {
    const srcIcon = path.join(rootDir, "pack_icon.png");
    if (!fs.existsSync(srcIcon)) {
        throw new Error("pack_icon.png not found in root directory.");
    }

    const bpIcon = path.join(rootDir, "BP", "pack_icon.png");

    fse.ensureDirSync(path.dirname(bpIcon));
    fse.copyFileSync(srcIcon, bpIcon);

    if (properties.resourcepack) {
        const rpIcon = path.join(rootDir, "RP", "pack_icon.png");
        const rpTexturesIcon = path.join(rootDir, "RP", "textures", properties.header.name, "pack_icon.png");

        [rpIcon, rpTexturesIcon].forEach(dst => {
            fse.ensureDirSync(path.dirname(dst));
            fse.copyFileSync(srcIcon, dst);
        });
    }
}
