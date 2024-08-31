# pymodules\__boot_message.py


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
    print(
        """
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
    """
    )

    print("-" * 50)
    print("☄   Atlas Initialization Sequence")
    print("")
    print(f"    Original Seed          : {seed_str}")
    print(f"    SHA-256 Seed Hash      : {seed_hash}")
    print(f"    Final Decimal Seed     : {seed}")
    print(f"    Cosmic Origin Time     : {cosmic_origin_time} ({cosmic_origin_datetime})")
    print(f"    Image Quality          : {image_quality}")
    print(f"    Enable Cache           : {enable_cache}")
    print(
        f"    Cache Cleanup Time     : {cache_cleanup_time} ({cache_cleanup_time / 60} minutes)"
    )
    print(f"    Version                : {version}")
    print(f"    Version Hash           : {version_hash}")
    print("-" * 50)
    print("")
