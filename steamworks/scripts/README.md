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

For the current macOS arm64 build, upload content from:

```txt
electron/release/steam/mac-arm64/Orion-7.app
```

The macOS depot keeps the app bundle at the depot root:

```txt
Orion-7.app
```

`app_build_4927190.vdf` sets the base content root to:

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
steamworks/scripts/app_build_4927190.vdf
steamworks/scripts/depot_build_4927191.vdf
```

They upload macOS depot `4927191`. The uploaded build is not assigned to a branch automatically:

```txt
SetLive: empty
```

Assign the build to `default`, `beta`, or another branch manually in Steamworks after the first successful upload.

Template files are kept as references. To recreate real `.vdf` files from templates:

```bash
cp steamworks/scripts/app_build_4927190.vdf.template steamworks/scripts/app_build_4927190.vdf
cp steamworks/scripts/depot_build_mac.vdf.template steamworks/scripts/depot_build_<MAC_DEPOT_ID>.vdf
```

Then replace:

- `<MAC_DEPOT_ID>` with the macOS Depot ID
- `<STEAM_LOGIN>` with a Steam account that has SteamPipe upload permissions

Upload:

```bash
steamcmd +login pokrov1991 +run_app_build "$(pwd)/steamworks/scripts/app_build_4927190.vdf" +quit
```

Do not put the Steam password into source files or npm scripts. SteamCMD will ask for password and Steam Guard code interactively if needed.

Do not upload `steam_appid.txt` to Steam depots. It is only for local development outside Steam.
