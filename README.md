# electron-maker-velopack

This is a maker for Electron Forge that uses *velopack* to build
distribution packages for an application.

For *velopack* docs, see https://docs.velopack.io .

## Status

This maker is in very early development. It works for my purposes
on Windows, but it is not thoroughly tested. Please consider it
a starting point.

## Supported platforms, prerequisites

XXX

The maker requires the command line tool `vpk` to be available on the path
and will fail with a corresponding error message otherwise.

## Usage

First, install `electron-maker-velopack` as a development dependency for your package:

    npm install --save-dev electron-maker-velopack

Then add some code of the following form to your `forgeConfig.js` file under `makers`:

    makers: [
        // ...
        {
            name: 'electron-maker-velopack',
            config: {
                // ... see below for configuration options ...
            },
        },
        // ...

## Configuration

The maker takes its default configuration from the electron packager configuration
and the `package.json` data, in that order of precedence. You only need to add
specific maker configuration options if you want to override something or you need
an option that is not available in the packager configuration or `package.json`.

Options specified in the maker configuration will always take precedence over
derived defaults.

The maker configuration has the following declaration:

    export type MakerVelopackConfig = {
        vpkProgram?: string,
        channel?: string,
        packId?: string,
        packVersion?: string,
        packAuthors?: string,
        packTitle?: string,
        shortcuts?: string[],
        noInstaller?: boolean,
        noPortable?: boolean,
        vpkExtraArguments?: string[],
    };

### vpkProgram

The velopack command line tool to run. Defaults to `vpk`, which is expected to be in `PATH`.

The maker will execute the given program first with only the `--help` argument, in order
to check whether the program is available.

### channel

The release channel to pass to the `--channel` argument of `vpk`. (Otherwise, `vpk` uses its default channel.)

### packId

The package id string to pass to the `--packId` argument of `vpk`. This must be a valid nupkg ID (containing
only alphanumeric characters, underscores, dashes, and dots). Defaults to the app name, with characters
not valid in nupkg IDs replaced by underscores.

This value is used for the `<id>` of the generated nupkg.

### packVersion

The version string to pass to the `--packVersion` argument of `vpk`. Defaults to `appVersion` in
the packager configuration, or a conversion of the `version` given in `package.json`.

Note: The conversion of the semantic package version is done to put it in a form compatible
with the nupkg version format.

See [Semantic Versioning specification](https://semver.org/)

See [NuGet versioning specification](https://learn.microsoft.com/en-us/nuget/concepts/package-versioning?tabs=semver20sort)

### packAuthors

The authors string to pass to the `--packAuthors` argument of `vpk`. Defaults author information pulled
from the `package.json` data.

### packTitle

A human-friendly name of the applicaton to pass to the `--packTitle` argument of `vpk`. Defaults
to `packagerConfig.name`, or `productName` from `package.json`, or the app name.

This value is used for both the `<title>` and the `<description>` of the generated nupkg.

### shortcuts

An array of strings specifying which shortcuts the installer should create. The values are passed
to the `--shortcuts` argument of `vpk`, separated by commas.

To create a shortcut in the top-level of the start menu, include `"StartMenuRoot"`.

To create a Desktop shortcut, include `"Desktop"`.

### noInstaller

If true, do not build the executable installer. (`--noInst` argument to `vpk`.)

### noPortable

If true, do not build the portable installer. (`--noPortable` argument to `vpk`.)

### vpkExtraArguments

An array of extra arguments to append to the invokation of the velopack command line tool.
(These arguments are not added when the maker is checking whether the command line tool is available.)

XXX

## License

This package is published under the MIT license. See the file `LICENSE` for details.

