# pymodules/__fixed.py

import hashlib


PORT = 5000
RUN = "PROD"
VERSION = "0.8.221"
VERSION_HASH = hashlib.sha256(VERSION.encode("utf-8")).hexdigest()
MAX_PILLOW_WORKERS = 4
