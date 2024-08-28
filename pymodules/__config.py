# pymodules/__config.py

import hashlib

# seed = 42  # Just scifi yo
# seed = 137  # Fine structure constant
# seed = 2718281828  # Eulers constant (e) approx to 10
# seed = 314159  # Mostly Pi
seed = 16180339887  # Golden ratio approx

version = "0.5.12"
versionHash = hashlib.sha256(version.encode("utf-8")).hexdigest()
