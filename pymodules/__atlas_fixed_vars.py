# pymodules/__atlas_fixed_vars.py

import hashlib


PORT = 5000
RUN = "PROD"
VERSION = "0.9.86"
VERSION_HASH = hashlib.sha256(VERSION.encode("utf-8")).hexdigest()
MAX_PILLOW_WORKERS = 4
VISUAL_DEBUG = False
