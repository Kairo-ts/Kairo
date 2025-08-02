import fs from 'fs';
import path from 'path';
import os from 'os';
import fse from 'fs-extra';

if (process.platform !== 'win32') {
    console.log('Not on Windows. Skipping copy.');
    process.exit(0);
}

const manifestPath = path.join(__dirname, 'BP', 'manifest.json');
const manifestRaw = fs.readFileSync(manifestPath, 'utf-8');
const manifest: any = JSON.parse(manifestRaw);
const addonName: string | undefined = manifest.header?.name;

if (!addonName) {
    console.error('Addon name not found in manifest.');
    process.exit(1);
}

const userHome = os.homedir();
const devBpRoot = path.join(userHome, 'AppData', 'Local', 'Packages');
const minecraftFolders = fs.readdirSync(devBpRoot).filter((name: string) =>
    name.startsWith('Microsoft.MinecraftUWP')
);

if (minecraftFolders.length === 0) {
    console.error('Minecraft UWP folder not found.');
    process.exit(1);
}

const minecraftPath = path.join(
    devBpRoot,
    minecraftFolders[0],
    'LocalState',
    'games',
    'com.mojang',
    'development_behavior_packs',
    addonName
);

const srcDir = path.join(__dirname, 'BP');
fse.ensureDirSync(minecraftPath);
fse.copySync(srcDir, minecraftPath, {
    overwrite: true
});

console.log(`Copied entire BP to ${minecraftPath}`);
