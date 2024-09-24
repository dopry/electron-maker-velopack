import { MakerBase, MakerOptions } from '@electron-forge/maker-base';
import { ForgePlatform } from '@electron-forge/shared-types';
import pathlib from 'path';

export type MakerVelopackConfig = object;

export default class MakerVelopack extends MakerBase<MakerVelopackConfig> {
    name = 'velopack';

    defaultPlatforms: ForgePlatform[] = ['win32'];

    isSupportedOnCurrentPlatform(): boolean {
        if (process.platform !== 'win32') {
            console.log("electron-maker-velopack is currently only supported on the win32 platform.");
            return false;
        }
        if (!this.isInstalled("velopack")) {
            console.log("Package 'velopack' is not installed, therefore electron-maker-velopack is not supported.");
            return false;
        }
        return true;
    }

    async make({ makeDir, targetArch }: MakerOptions): Promise<string[]> {
        const outPath = pathlib.resolve(makeDir, `velopack/${targetArch}`);
        await this.ensureDirectory(outPath);

        const artifacts = [
            pathlib.resolve(outPath, 'RELEASES'),
        ];
        return artifacts;
    }
}

export { MakerVelopack };
