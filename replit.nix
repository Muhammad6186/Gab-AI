{ pkgs }: {
  env = { LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [pkgs.libuuid]; };
  deps = [
    pkgs.chromium
    pkgs.unzipNLS
        pkgs.libuuid

  ];
}