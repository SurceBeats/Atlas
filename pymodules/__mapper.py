# pymodules/_geofencer.py

import base64
import re


def is_valid_base64(s):
    base64_regex = (
        r"^(?:[A-Za-z0-9+/\-_]{4})*(?:[A-Za-z0-9+/\-_]{2}==|[A-Za-z0-9+/\-_]{3}=)?$"
    )
    return re.match(base64_regex, s) is not None


def encode_url(data):
    return base64.urlsafe_b64encode(data.encode()).decode()


def decode_url(encoded_data):
    try:
        if len(encoded_data) % 4 != 0:
            return None

        if not is_valid_base64(encoded_data):
            return None

        decoded_data = base64.urlsafe_b64decode(encoded_data.encode()).decode()

        if not re.match(
            r"^coordinates=\d+,\d+,\d+(&system=\d+(&planet=[A-Za-z0-9_\-]+)?)?$",
            decoded_data,
        ):
            return None

        return decoded_data
    except (base64.binascii.Error, ValueError) as e:
        return None


def generate_galaxy_url(galaxy_coordinates):
    data = f"coordinates={galaxy_coordinates[0]},{galaxy_coordinates[1]},{galaxy_coordinates[2]}"
    encoded_data = encode_url(data)
    return f"/mapper/{encoded_data}"


def generate_system_url(galaxy_coordinates, system_index):
    data = f"coordinates={galaxy_coordinates[0]},{galaxy_coordinates[1]},{galaxy_coordinates[2]}&system={system_index}"
    encoded_data = encode_url(data)
    return f"/mapper/{encoded_data}"


def generate_planet_url(galaxy_coordinates, system_index, planet_name):
    planet_name = planet_name.lower()
    data = f"coordinates={galaxy_coordinates[0]},{galaxy_coordinates[1]},{galaxy_coordinates[2]}&system={system_index}&planet={planet_name}"
    encoded_data = encode_url(data)
    return f"/mapper/{encoded_data}"
