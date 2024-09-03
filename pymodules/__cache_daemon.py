# pymodules/__cache_daemon.py

import os
import time
from threading import Thread
from pymodules.__cache import cache_dir
from pymodules.__config import cache_cleanup_time


def clear_cache():
    while True:
        now = time.time()

        for filename in os.listdir(cache_dir):
            filepath = os.path.join(cache_dir, filename)
            if os.path.isfile(filepath):
                file_creation_time = os.path.getctime(filepath)
                
                # Asegúrate de que `cache_cleanup_time` no sea None
                if cache_cleanup_time is None:
                    raise ValueError("cache_cleanup_time is not initialized properly.")
                
                if now - file_creation_time > cache_cleanup_time:
                    os.remove(filepath)
        time.sleep(60)


def start_cache_daemon():
    cache_cleaner_thread = Thread(target=clear_cache)
    cache_cleaner_thread.daemon = True
    cache_cleaner_thread.start()
