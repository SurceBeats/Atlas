# pymodules/__config.py

import hashlib
import configparser
import os

from pymodules.__boot_message import display_boot_message
from pymodules.__config_helpers import custom_timestamp_to_date, create_default_config


if not os.path.exists("atlas.ini"):
    create_default_config()

config = configparser.ConfigParser()
config.read("atlas.ini")

seed_str = config.get("Settings", "seed")
seed_hash = hashlib.sha256(seed_str.encode("utf-8")).hexdigest()
seed = int(seed_hash, 16)

cosmic_origin_time = int(config.get("Settings", "cosmic_origin_time"))
cosmic_origin_datetime = custom_timestamp_to_date(cosmic_origin_time)

image_quality = int(config.get("Settings", "image_quality"))
enable_cache = config.getboolean("Settings", "enable_cache")
cache_cleanup_time = int(config.get("Settings", "cache_cleanup_time"))

version = "0.7.21"
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
