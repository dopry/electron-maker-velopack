import { MakerBase, MakerOptions } from '@electron-forge/maker-base';
import { ForgePlatform } from '@electron-forge/shared-types';
import path from 'path';
import fs from 'fs-extra';
import { execFileSync } from 'node:child_process';

function runCommand(program, args, silent: boolean = false) {
    const options : {[k: string]: any} = {};
    if (silent)
        options.stdio = 'pipe';
    else
        options.stdio = 'inherit';
    execFileSync(program, args, options);
}

export type MakerVelopackConfig = object;

const vpk_program = "vpk";

export default class MakerVelopack extends MakerBase<MakerVelopackConfig> {
    name = 'velopack';

    defaultPlatforms: ForgePlatform[] = ['win32'];

    isSupportedOnCurrentPlatform(): boolean {
        if (process.platform !== 'win32') {
            console.log("electron-maker-velopack is currently only supported on the win32 platform.");
            return false;
        }
        const vpk_args = ["--help"];
        const vpk_check_command = [vpk_program, ...vpk_args].join(" ");
        try {
            runCommand(vpk_program, vpk_args, true);
        }
        catch (error) {
            console.error(error);
            console.log(`

electron-maker-velopack: The required command line tool 'vpk' does not seem to be available.
(Failed to run command '${vpk_check_command}'.)

You can install 'vpk' by running:

    dotnet tool update -g vpk

This requires a .NET SDK to be installed and the .NET SDK tools to be available in PATH.
(You may need to re-enter the command interpreter session after installing the .NET SDK
to make changes in PATH effective.)

`);
            return false;
        }
        return true;
    }

    async make({ appName, dir, makeDir, targetArch, packageJSON, forgeConfig }: MakerOptions): Promise<string[]> {
        const outPath = path.resolve(makeDir, `velopack/${targetArch}`);
        await this.ensureDirectory(outPath);

        const exe_name = `${forgeConfig.packagerConfig.executableName || appName}.exe`
        const exe_path = path.join(dir, exe_name);

        if (!await fs.pathExists(exe_path)) {
            throw new Error(`The executable to package does not exist at the expected path: ${exe_path}.`);
        }

        const vpk_args = ["pack",
                          "--packId", appName,
                          "--packVersion", packageJSON.version,
                          "--packDir", dir,
                          "--mainExe", exe_name,
                          "--outputDir", outPath];

        const vpk_command = [vpk_program, ...vpk_args].join(" ");

        try {
            runCommand(vpk_program, vpk_args);
        }
        catch (error) {
            throw new Error(`Could not create velopack package.\nFailed command: ${vpk_command}\n\n${error}\n`);
        }

        const artifacts = [
            path.resolve(outPath, 'RELEASES'),
        ];
        return artifacts;
    }
}

export { MakerVelopack };
