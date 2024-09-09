# pymodules/__drawer_base.py

import asyncio

from concurrent.futures import ThreadPoolExecutor


from pymodules.__atlas_fixed_vars import MAX_PILLOW_WORKERS

from pymodules.__universe_base import Galaxy, Planet, SolarSystem

from pymodules.__drawer_class_planet import generate_planet_image
from pymodules.__drawer_class_system import generate_solar_system_image
from pymodules.__drawer_class_galaxy import generate_galaxy_image


async def handle_image_generation(objs):
    loop = asyncio.get_event_loop()
    results = []

    if not isinstance(objs, list):
        objs = [objs]

    with ThreadPoolExecutor(max_workers=MAX_PILLOW_WORKERS) as executor:
        futures = []
        for obj in objs:
            if isinstance(obj, Planet):
                futures.append(
                    loop.run_in_executor(executor, generate_planet_image, obj)
                )
            elif isinstance(obj, SolarSystem):
                futures.append(
                    loop.run_in_executor(executor, generate_solar_system_image, obj)
                )
            elif isinstance(obj, Galaxy):
                futures.append(
                    loop.run_in_executor(executor, generate_galaxy_image, obj)
                )
            else:
                raise ValueError("Unknown object type for image generation, wyd bro?")

        for future in asyncio.as_completed(futures):
            result = await future
            results.append(result)

    if len(results) == 1:
        return results[0]
    return results
