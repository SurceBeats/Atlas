# pymodules/__config.py

import hashlib
import configparser
import os
import time

config = configparser.ConfigParser()
config.read("atlas.ini")

seed = float(config.get("Settings", "seed"))
image_quality = int(config.get("Settings", "image_quality"))
enable_cache = config.getboolean("Settings", "enable_cache")
cache_cleanup_time = int(config.get("Settings", "cache_cleanup_time"))

version = "0.6.51"
versionHash = hashlib.sha256(version.encode("utf-8")).hexdigest()


def create_default_config(filename="atlas.ini"):
    config = configparser.ConfigParser()

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
