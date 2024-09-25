import { MakerBase, MakerOptions } from '@electron-forge/maker-base';
import { ForgePlatform } from '@electron-forge/shared-types';
import path from 'path';
import fs from 'fs-extra';
import { execFileSync } from 'node:child_process';

export type MakerVelopackConfig = {
    vpkProgram?: string,
    channel?: string,
    packId?: string,
    packVersion?: string,
    packAuthors?: string,
    packTitle?: string,
    noInstaller?: boolean,
    noPortable?: boolean,
    vpkExtraArguments?: string[],
};

const default_vpk_program = "vpk";

// --------------------------------------------------------------

/**
 * A utility function to convert SemVer version strings into NuGet-compatible
 * version strings.
 * @param version A SemVer version string
 * @returns A NuGet-compatible version string
 * @see {@link https://semver.org/ | Semantic Versioning specification}
 * @see {@link https://learn.microsoft.com/en-us/nuget/concepts/package-versioning?tabs=semver20sort | NuGet versioning specification}
 */
function convertVersion(version: string): string {
    const parts = version.split('+')[0].split('-');
    const mainVersion = parts.shift();

    if (parts.length > 0) {
        return [mainVersion, parts.join('-').replace(/\./g, '')].join('-');
    } else {
        return mainVersion as string;
    }
}

// --------------------------------------------------------------

function convertNameToNupkgId(name: string): string {
    return name.replace(/[^-A-Za-z0-9_.]/g, "_");
}

export default class MakerVelopack extends MakerBase<MakerVelopackConfig> {
    name = 'velopack';

    defaultPlatforms: ForgePlatform[] = ['win32'];

    isSupportedOnCurrentPlatform(): boolean {
        return true;
    }

    checkVpkProgramAvailable(): void {
        // Note: We cannot do this in `isSupportedOnCurrentPlatform` because this.config is not
        //       yet set when that method is called.
        //
        const vpk_program = this.getVpkProgram();
        const vpk_args = ["--help"];
        const vpk_check_command = [vpk_program, ...vpk_args].join(" ");
        try {
            // we 'ignore' stdout to hide normal output; stderr remains visible to the user
            execFileSync(vpk_program, vpk_args, { stdio: ['inherit', 'ignore', 'inherit'] });
        }
        catch (error) {
            console.error(error);
            throw new Error(`

electron-maker-velopack: The required command line tool '${vpk_program}' does not seem to be available.
(Failed to run command '${vpk_check_command}'.)

You can install 'vpk' by running:

    dotnet tool update -g vpk

This requires a .NET SDK to be installed and the .NET SDK tools to be available in PATH.
(You may need to re-enter the command interpreter session after installing the .NET SDK
to make changes in PATH effective.)

`);
        }
    }

    async make({ appName, dir, makeDir, targetPlatform, targetArch, packageJSON, forgeConfig }: MakerOptions): Promise<string[]> {
        this.checkVpkProgramAvailable();

        const outPath = path.resolve(makeDir, `velopack/${targetPlatform}/${targetArch}`);
        await this.ensureDirectory(outPath);

        const exe_name = `${forgeConfig.packagerConfig.executableName || appName}.exe`
        const exe_path = path.join(dir, exe_name);

        if (!await fs.pathExists(exe_path)) {
            throw new Error(`The executable to package does not exist at the expected path: ${exe_path}.`);
        }

        const version = this.config.packVersion ?? forgeConfig.packagerConfig.appVersion ?? convertVersion(packageJSON.version as string);
        const title = this.config.packTitle ?? forgeConfig.packagerConfig.name ?? packageJSON.productName ?? appName;

        let authors = this.config.packAuthors ?? packageJSON.authors ?? "";
        if (!authors && packageJSON.author) {
            authors = packageJSON.author;
            if (typeof authors !== "string")
                authors = packageJSON.author.name;
        }

        const vpk_program = this.getVpkProgram();

        const vpk_args = ["pack",
                          "--packId", this.config.packId ?? convertNameToNupkgId(appName),
                          "--packVersion", version,
                          "--packDir", dir,
                          "--packAuthors", authors,
                          "--packTitle", title,

                          "--mainExe", exe_name,
                          "--outputDir", outPath,

/*
                          "--runtime", XXX,
                          "--releaseNotes", XXX,
                          "--delta", XXX,
                          "--icon", XXX,
                          "--exclude", XXX,
                          "--framework", XXX,
                          "--splashImage", XXX,
                          "--skipVeloAppCheck", XXX,
                          "--signTemplate", XXX,
                          "--signSkipDll", XXX,
                          "--signParallel", XXX,
                          "--shortcuts", XXX,
                          "--signParams", XXX,
                          */
                          ];

        if (this.config.channel != null)
            vpk_args.push("--channel", this.config.channel);

        if (this.config.noPortable)
            vpk_args.push("--noPortable");

        if (this.config.noInstaller)
            vpk_args.push("--noInst");

        if (this.config.vpkExtraArguments)
            vpk_args.push(...this.config.vpkExtraArguments);

        const vpk_command = [vpk_program, ...vpk_args].join(" ");

        try {
            console.log("Running " + vpk_command);
            // inherit stdio to allow interactive input/output of vpk
            // That is also why we have to use the ...Sync function here.
            execFileSync(vpk_program, vpk_args, { stdio: ['inherit', 'inherit', 'pipe'] });
        }
        catch (error) {
            throw new Error(`Could not create velopack package.\nFailed command: ${vpk_command}\n\n${error.stderr ?? error}\n`);
        }

        const artifacts = [
            path.resolve(outPath, 'RELEASES'),
        ];
        return artifacts;
    }

    getVpkProgram(): string {
        return this.config.vpkProgram ?? default_vpk_program;
    }
}

export { MakerVelopack };
