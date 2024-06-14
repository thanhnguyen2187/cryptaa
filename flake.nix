{
  description = "A very basic flake";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs";
  };

  outputs = { self, nixpkgs, ... }:
  let
    system = "x86_64-linux";
    pkgs = import nixpkgs { inherit system; };
  in {
    packages.${system}.cryptaa-server = pkgs.buildNpmPackage {
      pname = "cryptaa-server";
      version = "1.0.0";
      src = ./.;
    };
  };
}
