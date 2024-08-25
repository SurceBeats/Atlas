import base64
from pymodules.__config import seed


def seedmaster(iterations):
    result = str(seed).encode("utf-8")

    for _ in range(iterations):
        result = base64.b64encode(result)

    if iterations == 0:
        return seed
    else:
        return result.decode("utf-8")
