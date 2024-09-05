# pymodules/__seedmaster.py

import base64
from pymodules.__atlasconfig import config


def seedmaster(iterations):
    result = str(config.seed).encode("utf-8")

    for _ in range(iterations):
        result = base64.b64encode(result)

    if iterations == 0:
        return config.seed
    else:
        return result.decode("utf-8")
