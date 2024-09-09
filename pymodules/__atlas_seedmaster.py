# pymodules/__atlas_seedmaster.py

import base64
import hashlib

from pymodules.__atlas_config import config


def seedmaster(iterations):
    result = str(config.seed).encode("utf-8")

    for _ in range(iterations):
        result = base64.b64encode(result)

    if iterations == 0:
        return config.seed
    else:
        return result.decode("utf-8")


def consistent_hash(input_string):
    return int(hashlib.md5(input_string.encode()).hexdigest(), 16)
