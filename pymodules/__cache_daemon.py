# pymodules/__cache_daemon.py

import os
import time
from threading import Thread
from pymodules.__cache import cache_dir
from pymodules.__config import config


def clear_cache():
    while True:
        now = time.time()

        for filename in os.listdir(cache_dir):
            filepath = os.path.join(cache_dir, filename)
            if os.path.isfile(filepath):
                file_creation_time = os.path.getctime(filepath)

                if config.cache_cleanup_time is None:
                    raise ValueError("cache_cleanup_time is not initialized properly.")

                if now - file_creation_time > config.cache_cleanup_time:
                    os.remove(filepath)
        time.sleep(60)


def start_cache_daemon():
    cache_cleaner_thread = Thread(target=clear_cache)
    cache_cleaner_thread.daemon = True
    cache_cleaner_thread.start()
