# pymodules/__config.py

import hashlib
import configparser
import os
import time

from datetime import datetime
from pymodules.__boot_message import display_boot_message

config = configparser.ConfigParser()


def create_default_config(filename="atlas.ini"):
    cosmic_origin_time = int(time.time())

    config["Settings"] = {
        "seed": "1.618033988749895",
        "cosmic_origin_time": str(cosmic_origin_time),
        "image_quality": "100",
        "enable_cache": "True",
        "cache_cleanup_time": "900",
    }

    with open(filename, "w") as configfile:
        config.write(configfile)


if not os.path.exists("atlas.ini"):
    create_default_config()

config.read("atlas.ini")

seed_str = config.get("Settings", "seed")
seed_hash = hashlib.sha256(seed_str.encode("utf-8")).hexdigest()
seed = int(seed_hash, 16)

cosmic_origin_time = int(config.get("Settings", "cosmic_origin_time"))
cosmic_origin_datetime = datetime.fromtimestamp(cosmic_origin_time).strftime(
    "%Y-%m-%d %H:%M:%S"
)

image_quality = int(config.get("Settings", "image_quality"))
enable_cache = config.getboolean("Settings", "enable_cache")
cache_cleanup_time = int(config.get("Settings", "cache_cleanup_time"))

version = "0.7.17"
versionHash = hashlib.sha256(version.encode("utf-8")).hexdigest()

display_boot_message(
    seed_str,
    seed_hash,
    seed,
    cosmic_origin_time,
    cosmic_origin_datetime,
    image_quality,
    enable_cache,
    cache_cleanup_time,
    version,
    versionHash,
)
