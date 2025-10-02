{
  description = "template slides";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

    typix = {
      url = "github:loqusion/typix";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    mkTypstDerivation = {
      url = "github:youwen5/mkTypstDerivation.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };

    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      nixpkgs,
      typix,
      flake-utils,
      mkTypstDerivation,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        typixLib = typix.lib.${system};
        mkTypstDerivationLib = import mkTypstDerivation { inherit pkgs; };

        src = ./.;
        commonArgs = {
          typstSource = "main.typ";
          fontPaths = [ ];
          virtualPaths = [ ];
        };

        typstPackages = mkTypstDerivationLib.fetchTypstPackages {
          inherit src;
          documentRoot = commonArgs.typstSource;
          hash = "sha256-8xl9VMd+h1/zHrUs4vd5MMpgQhmJDoJDAC2hypP2s5o=";
        };

        typstPackagesCache = pkgs.stdenv.mkDerivation {
          name = "typst-packages-cache";
          src = "${typstPackages}/typst/packages";
          dontBuild = true;
          installPhase = ''
            mkdir -p "$out/typst/packages"
            cp -LR --reflink=auto --no-preserve=mode -t "$out/typst/packages" "$src"/*
          '';
        };

        # compile a typst project, *without* copying the result
        # to the current directory
        build-drv = typixLib.buildTypstProject (
          commonArgs
          // {
            inherit src;
            XDG_CACHE_HOME = typstPackagesCache;
          }
        );

        # compile a typst project, and then copy the result
        # to the current directory
        build-script = typixLib.buildTypstProjectLocal (
          commonArgs
          // {
            inherit src;
            XDG_CACHE_HOME = typstPackagesCache;
          }
        );

        # watch a project and recompile on changes
        watch-script = typixLib.watchTypstProject commonArgs;
      in
      {
        packages.default = build-drv;

        apps = rec {
          default = watch;
          build = flake-utils.lib.mkApp {
            drv = build-script;
          };
          watch = flake-utils.lib.mkApp {
            drv = watch-script;
          };
        };

        devShells.default = typixLib.devShell {
          inherit (commonArgs) fontPaths virtualPaths;
          packages = [
            # WARNING: don't run `typst-build` directly, instead use `nix run .#build`
            # See https://github.com/loqusion/typix/issues/2
            build-script
            watch-script
            pkgs.typstyle
          ];
        };

        formatter = nixpkgs.legacyPackages.${system}.nixfmt-rfc-style;
      }
    );
}
