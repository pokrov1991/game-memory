# SteamPipe scripts

These files are templates. Replace depot placeholders with real Depot IDs from Steamworks App Admin before upload.

Steam Login:

```txt
pokrov1991
```

Current App ID:

```txt
4927190
```

DepotID for macOS:

```txt
4927191
```

DepotID for Windows:

```txt
4927192
```

For the current macOS arm64 build, upload content from:

```txt
electron/release/steam/mac-arm64/Orion-7.app
```

The macOS depot keeps the app bundle at the depot root:

```txt
Orion-7.app
```

For the Windows build, upload content from:

```txt
electron/release/steam/win-unpacked
```

The Windows depot maps the contents of `win-unpacked` to the depot root and excludes `steam_appid.txt`.

Both platform-specific AppBuild files set the base content root to:

```txt
../../electron/release/steam
```

`depot_build_4927191.vdf` uses `ContentRoot` relative to that base:

```txt
mac-arm64
```

Use this Steamworks launch option for the macOS depot:

```txt
Executable: Orion-7.app
Arguments:
OS: macOS
Description: Orion-7
```

Real upload files are already prepared:

```txt
steamworks/scripts/app_build_4927190_mac.vdf
steamworks/scripts/depot_build_4927191.vdf
steamworks/scripts/app_build_4927190_windows.vdf
steamworks/scripts/depot_build_4927192.vdf
```

`app_build_4927190_mac.vdf` uploads only macOS depot `4927191`. `app_build_4927190_windows.vdf` uploads only Windows depot `4927192`. The uploaded build is not assigned to a branch automatically:

```txt
SetLive: empty
```

Assign the build to `default`, `beta`, or another branch manually in Steamworks after the first successful upload.

Template files are kept as references. To recreate real `.vdf` files from templates:

```bash
cp steamworks/scripts/app_build_4927190_mac.vdf.template steamworks/scripts/app_build_4927190_mac.vdf
cp steamworks/scripts/depot_build_mac.vdf.template steamworks/scripts/depot_build_<MAC_DEPOT_ID>.vdf
```

Then replace:

- `<MAC_DEPOT_ID>` with the macOS Depot ID
- `<WIN_DEPOT_ID>` with the Windows Depot ID
- `<STEAM_LOGIN>` with a Steam account that has SteamPipe upload permissions

Build macOS Steam content without uploading:

```bash
npm run dist:steam:mac
```

Build and upload only the macOS depot:

```bash
npm run deploy:steam:mac
```

Build Windows Steam content without uploading:

```bash
npm run dist:steam:windows
```

Build and upload only the Windows depot:

```bash
npm run deploy:steam:windows
```

Use this Steamworks launch option for the Windows depot:

```txt
Executable: Orion-7.exe
Arguments:
OS: Windows
Description: Orion-7
```

Equivalent direct SteamCMD commands:

```bash
steamcmd +login pokrov1991 +run_app_build steamworks/scripts/app_build_4927190_mac.vdf +quit
steamcmd +login pokrov1991 +run_app_build steamworks/scripts/app_build_4927190_windows.vdf +quit
```

Do not put the Steam password into source files or npm scripts. SteamCMD will ask for password and Steam Guard code interactively if needed.

Do not upload `steam_appid.txt` to Steam depots. It is only for local development outside Steam.
