import { MakerBase, MakerOptions } from '@electron-forge/maker-base';
import { ForgePlatform } from '@electron-forge/shared-types';
import pathlib from 'path';

export type MakerVelopackConfig = {
}

export default class MakerVelopack extends MakerBase<MakerVelopackConfig> {
    name = 'velopack';

    defaultPlatforms: ForgePlatform[] = ['win32'];

    isSupportedOnCurrentPlatform(): boolean {
        return 
    }

    async make({ dir, makeDir, targetArch, packageJSON, appName, forgeConfig }: MakerOptions): Promise<string[]> {
        const outPath = pathlib.resolve(makeDir, `velopack/${targetArch}`);
        await this.ensureDirectory(outPath);

        const artifacts = [
            pathlib.resolve(outPath, 'RELEASES'),
        ];
        return artifacts;
    }
}

export { MakerVelopack };
