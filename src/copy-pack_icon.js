import path from "path";
import fs from "fs";
import fse from "fs-extra";
import { getSafeFolderName } from "./path-utils.js";

export function writePackIcon(rootDir, properties) {
    const srcIcon = path.join(rootDir, "pack_icon.png");
    if (!fs.existsSync(srcIcon)) {
        throw new Error("pack_icon.png not found in root directory.");
    }

    const bpIcon = path.join(rootDir, "BP", "pack_icon.png");

    fse.ensureDirSync(path.dirname(bpIcon));
    fse.copyFileSync(srcIcon, bpIcon);

    if (properties.resourcepack) {
        if (!properties.id) throw new Error("Addon id not found in properties.");
        const safeFolderName = getSafeFolderName(properties.id, "addon id");
        const rpIcon = path.join(rootDir, "RP", "pack_icon.png");
        const rpTexturesIcon = path.join(
            rootDir,
            "RP",
            "textures",
            safeFolderName,
            "pack_icon.png",
        );

        [rpIcon, rpTexturesIcon].forEach((dst) => {
            fse.ensureDirSync(path.dirname(dst));
            fse.copyFileSync(srcIcon, dst);
        });
    }
}
