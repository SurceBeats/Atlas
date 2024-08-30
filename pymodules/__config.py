# pymodules/__config.py

import hashlib
import configparser

config = configparser.ConfigParser()
config.read("atlas.ini")

seed = float(config.get("Settings", "seed"))
image_quality = int(config.get("Settings", "image_quality"))
enable_cache = config.getboolean("Settings", "enable_cache")
cache_cleanup_time = int(config.get("Settings", "cache_cleanup_time"))

version = "0.6.49"
versionHash = hashlib.sha256(version.encode("utf-8")).hexdigest()
