# pymodules/__config.py

import hashlib
import configparser
import os
import time
import random
from pymodules.__boot_message import display_boot_message, display_intro_message
from pymodules.__config_helpers import custom_timestamp_to_date
from pymodules.__fixed import VERSION, VERSION_HASH, PORT


class Config:
    _instance = None
    display_intro_message(PORT)

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Config, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def initialize(self):


        if self._initialized:
            return True

        if not os.path.exists("atlas.ini"):
            return False

        config = configparser.ConfigParser()
        config.read("atlas.ini")

        self.seed_str = config.get("Settings", "seed")

        self.seed_hash = hashlib.sha256(self.seed_str.encode("utf-8")).hexdigest()
        self.seed = int(self.seed_hash, 16)

        self.cosmic_origin_time = config.get("Settings", "cosmic_origin_time")
        self.cosmic_origin_time = int(self.cosmic_origin_time)

        self.cosmic_origin_datetime = custom_timestamp_to_date(self.cosmic_origin_time)

        self.image_quality = config.get("Settings", "image_quality")
        self.image_quality = int(self.image_quality)

        self.enable_cache = config.get("Settings", "enable_cache")
        self.enable_cache = config.getboolean("Settings", "enable_cache")

        self.cache_cleanup_time = config.get("Settings", "cache_cleanup_time")
        self.cache_cleanup_time = int(self.cache_cleanup_time)

        display_boot_message(
            self.seed_str,
            self.seed_hash,
            self.seed,
            self.cosmic_origin_time,
            self.cosmic_origin_datetime,
            self.image_quality,
            self.enable_cache,
            self.cache_cleanup_time,
            VERSION,
            VERSION_HASH,
        )

        self._initialized = True
        return True

    def create_atlas_ini(self, seed_str, cosmic_origin_time):
        config = configparser.ConfigParser()
        config["Settings"] = {
            "seed": seed_str,
            "cosmic_origin_time": str(cosmic_origin_time),
            "image_quality": "100",
            "enable_cache": "True",
            "cache_cleanup_time": "900",
        }
        with open("atlas.ini", "w") as configfile:
            config.write(configfile)

    def generate_hex_seed(self):
        hex_seed = f"0x{random.randint(0, 0xFFFFFFFF):08X}"
        return hex_seed

    def setup_universe(self, universe_type):
        if universe_type == "default":
            seed_str = "1.618033988749895"
            cosmic_origin_time = 514080000
        else:
            seed_str = f"{self.generate_hex_seed()}-{self.generate_hex_seed()}-{self.generate_hex_seed()}"
            cosmic_origin_time = int(time.time())

        self.create_atlas_ini(seed_str, cosmic_origin_time)

        return self.initialize()

    @property
    def is_initialized(self):
        return self._initialized


config = Config()
