import esbuild from "esbuild";

await esbuild.build({
    entryPoints: ["scripts/index.ts", "scripts/properties.ts"],
    bundle: true,
    format: "esm",
    platform: "neutral",
    target: "es2020",
    outdir: "BP/scripts",
    sourcemap: false,

    external: ["@minecraft/server", "@minecraft/server-ui"],
});
