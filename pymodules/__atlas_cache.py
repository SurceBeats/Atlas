# pymodules/__atlas_cache.py

import os
import hashlib

cache_dir = "static/cache"
if not os.path.exists(cache_dir):
    os.makedirs(cache_dir)


def generate_cache_filename(
    identifier_type, coordinates, system_name, planet_name=None
):
    identifier = f"{coordinates}_{system_name}"
    if planet_name:
        identifier += f"_{planet_name}"

    hash_object = hashlib.md5(identifier.encode())
    hash_filename = f"{identifier_type}_{hash_object.hexdigest()}.webp"

    return hash_filename


def get_cached_image_path(identifier_type, coordinates, system_name, planet_name=None):
    cache_filename = generate_cache_filename(
        identifier_type, coordinates, system_name, planet_name
    )
    return os.path.join(cache_dir, cache_filename)
