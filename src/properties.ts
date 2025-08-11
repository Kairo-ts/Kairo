/**
 * scripts/properties から manifest.jsonを自動生成する
 * propertiesは、アドオン間通信においても、識別などに利用する
 */

export type SemVer = {
    major: number; minor: number; patch: number;
    prerelease?: string; // "preview.3" / "rc.1"
    build?: string;      // "abc123" (commit)
};

export const properties = {
    metadata: { 
        /** 製作者の名前 */
        authors: [
            "shizuku86"
        ]
    },
    header: {
        name: "Kairo",
        description: "Enables communication between multiple behavior packs by leveraging the ScriptAPI as a communication layer.",
        version: { 
            major: 1, 
            minor: 0, 
            patch: 0,
        } as SemVer,
        min_engine_version: [ 1,21,100 ] as [number,number,number],
        uuid: "45826daa-bf9f-4443-b746-944a0970bfef"
    },
    modules: [
        {
            type: "script",
			language: "javascript",
			entry: "scripts/index.js",
            version: "header.version",
            uuid: "1d3bfdf2-7456-435b-bacf-c94c0d7b7c64"
        }
    ],
    dependencies: [
		{
			module_name: "@minecraft/server",
			version: "2.1.0"
		},
		{
			module_name: "@minecraft/server-ui",
			version: "2.0.0"
		}
	],
    /** 前提アドオン */
    requiredAddons: {
        /**
         * name: [version]
         */
    },
    tags: [
        "official",
        "stable",
    ] as string[],
}