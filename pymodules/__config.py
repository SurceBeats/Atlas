# pymodules/__config.py

import hashlib

# seed = 42  # Just scifi yo
# seed = 0.0072973525693  # Fine structure constant
# seed = 2.7182818284590452353602874713526624977572  # Eulers constant (e)
# seed = 3.1415926535897932384626433832795028841971 # Pi
seed = 1.618033988749895  # Golden Ratio

version = "0.5.14"
versionHash = hashlib.sha256(version.encode("utf-8")).hexdigest()
