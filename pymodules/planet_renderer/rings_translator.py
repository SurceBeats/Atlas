# pymodules/planet_renderer/rings_translator.py

import math
import random
from typing import Dict, Any, List, Tuple


class RingsTranslator:

    def _generate_bands(self, planet_radius: int, rng: random.Random) -> List[Tuple[float, float]]:
        num_bands = rng.randint(2, 4)

        first_inner = planet_radius + rng.randint(80, 120)
        total_extent = planet_radius * rng.uniform(0.8, 1.2) 

        bands = []
        current_pos = first_inner

        for i in range(num_bands):
            band_width = rng.randint(30, 70) * (1.0 - i * 0.15)
            band_inner = current_pos
            band_outer = current_pos + band_width

            bands.append((band_inner, band_outer))

            gap = rng.randint(15, 40)
            current_pos = band_outer + gap

        return bands

    def translate_rings(self, planet, planet_radius: int, rng: random.Random, tilt_factor: float, angle_rotation: float) -> Dict[str, Any]:
        bands = self._generate_bands(planet_radius, rng)

        # A Super Ringed planet's rings reach ten times as far out from their inner edge
        if planet.planet_type == "Super Ringed":
            first = bands[0][0]
            bands = [(first + (a - first) * 10, first + (b - first) * 10) for a, b in bands]

        ring_inner_radius = bands[0][0]
        ring_outer_radius = bands[-1][1]

        num_particles_per_band = rng.randint(600, 1200)
        shape_seed = rng.randint(0, 2147483647)

        return {
            "has_rings": True,
            "inner_radius": ring_inner_radius,
            "outer_radius": ring_outer_radius,
            "tilt_factor": tilt_factor,
            "rotation_angle": angle_rotation,
            "planet_radius": planet_radius,
            "shape_seed": shape_seed,
            "num_particles_per_band": num_particles_per_band,
            "bands": [{"inner": b[0], "outer": b[1]} for b in bands]
        }
