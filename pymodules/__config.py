import hashlib
import configparser
import os
from pymodules.__boot_message import display_boot_message
from pymodules.__config_helpers import custom_timestamp_to_date

config = configparser.ConfigParser()

# Variables globales
seed = None
cosmic_origin_time = None
image_quality = None
enable_cache = None
cache_cleanup_time = None
version = "0.7.47"
versionHash = hashlib.sha256(version.encode("utf-8")).hexdigest()

def create_atlas_ini(seed_str, cosmic_origin_time):
    """Crea el archivo atlas.ini con la configuración inicial."""
    config["Settings"] = {
        "seed": seed_str,
        "cosmic_origin_time": str(cosmic_origin_time),
        "image_quality": "100",
        "enable_cache": "True",
        "cache_cleanup_time": "900",
    }
    with open("atlas.ini", "w") as configfile:
        config.write(configfile)

def initialize_config():
    """Inicializa la configuración leyendo el archivo atlas.ini y configurando los valores globales."""
    global seed, cosmic_origin_time, image_quality, enable_cache, cache_cleanup_time, version, versionHash

    if not os.path.exists("atlas.ini"):
        return False

    config.read("atlas.ini")

    seed_str = config.get("Settings", "seed")
    print("Seed:", seed_str)
    if seed_str is None:
        raise ValueError("Seed is not defined in the config file.")
    
    seed_hash = hashlib.sha256(seed_str.encode("utf-8")).hexdigest()
    seed = int(seed_hash, 16)
    print("Final Seed (int):", seed)  # Verifica que seed ha sido correctamente inicializada

    cosmic_origin_time = config.get("Settings", "cosmic_origin_time")
    print("Cosmic Origin Time (raw):", cosmic_origin_time)
    if cosmic_origin_time is None:
        raise ValueError("Cosmic origin time is not defined in the config file.")
    cosmic_origin_time = int(cosmic_origin_time)
    print("Cosmic Origin Time (int):", cosmic_origin_time)
    
    cosmic_origin_datetime = custom_timestamp_to_date(cosmic_origin_time)

    image_quality = config.get("Settings", "image_quality")
    print("Image Quality:", image_quality)
    if image_quality is None:
        raise ValueError("Image quality is not defined in the config file.")
    image_quality = int(image_quality)

    enable_cache = config.get("Settings", "enable_cache")
    print("Enable Cache:", enable_cache)
    if enable_cache is None:
        raise ValueError("Enable cache setting is not defined in the config file.")
    enable_cache = config.getboolean("Settings", "enable_cache")

    cache_cleanup_time = config.get("Settings", "cache_cleanup_time")
    print("Cache Cleanup Time (raw):", cache_cleanup_time)
    if cache_cleanup_time is None:
        raise ValueError("Cache cleanup time is not defined in the config file.")
    cache_cleanup_time = int(cache_cleanup_time)
    print("Cache Cleanup Time (int):", cache_cleanup_time)

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

    print("Configuration initialized successfully with seed:", seed)
    return True

# Intentar inicializar la configuración al importar el módulo
config_initialized = initialize_config()
