# pymodules\__atlas_boot_message.py

import socket


def get_local_addresses(port):
    hostnames = socket.gethostbyname_ex(socket.gethostname())[2]
    addresses = [f"http://{hostname}:{port}" for hostname in hostnames]
    return addresses


def display_intro_message(port):
    addresses = get_local_addresses(port)
    print(
        f"""
                .          .    .
        .          .     *       .
            .      .     .  *       .    *
        *      *     .     *   .    .
    .     *   .      _____       .  *  .
        .    .  .   /     \  .    *
        *    .   . /       \     .  .  *
    .  .       .  |  ATLAS  | .  .    *
        *  *     . \_______/     .  *
    .  .     . *  .       .  *  .   .   .
        *  .    .    .    . * .       .  .
    .      .       .   . *  .    *       .
            .   *  .    *       .    .
    *    .      .  *     .     .  *    .
            .      .   . *    .   .
                .          .   . 

    \033[1mAtlas Initialization Protocol: Running...\033[0m
    """
    )
    for address in addresses:
        print(f">   {address}")


def display_boot_message(
    seed_str,
    seed_hash,
    seed,
    cosmic_origin_time,
    cosmic_origin_datetime,
    image_quality,
    enable_cache,
    cache_cleanup_time,
    version,
    version_hash,
):

    print("")
    print("☄️   \033[1mAtlas Initialization Sequence:\033[0m")
    print("")
    print("\033[94m" + "=" * 50 + "\033[0m")
    print(f"\033[1m    Original Seed\033[0m          : \033[92m{seed_str}\033[0m")
    print(f"\033[1m    SHA-256 Seed Hash\033[0m      : \033[92m{seed_hash}\033[0m")
    print(f"\033[1m    Final Decimal Seed\033[0m     : \033[92m{seed}\033[0m")
    print(
        f"\033[1m    Cosmic Origin Time\033[0m     : \033[92m{cosmic_origin_time}\033[0m (\033[93m{cosmic_origin_datetime}\033[0m)"
    )
    print(f"\033[1m    Image Quality\033[0m          : \033[92m{image_quality}\033[0m")
    print(f"\033[1m    Enable Cache\033[0m           : \033[92m{enable_cache}\033[0m")
    print(
        f"\033[1m    Cache Cleanup Time\033[0m     : \033[92m{cache_cleanup_time}\033[0m (\033[93m{cache_cleanup_time / 60} minutes\033[0m)"
    )
    print(f"\033[1m    Version\033[0m                : \033[92m{version}\033[0m")
    print(f"\033[1m    Version Hash\033[0m           : \033[92m{version_hash}\033[0m")
    print("\033[94m" + "=" * 50 + "\033[0m")
    print("")
