# pymodules/__universe_init_solarsystem.py

import random
import hashlib

from pymodules.__atlas_seedmaster import seedmaster
from pymodules.__universe_name_generator import generate_name


class SolarSystem:
    def __init__(self, seed, index, constants):
        self.seed = seed
        self.index = index
        self.constants = constants
        random.seed(seed)
        self.name = generate_name(seed + index, "system")
        self.num_planets = random.randint(1, 6)
        self.planets = {}

        self.star_system_type = self.determine_star_system_type()
        self.stars = self.generate_stars()

        for i in range(self.num_planets):
            from pymodules.__universe_init_planet import Planet

            planet_seed = int(
                hashlib.sha256(f"{self.seed}-{seedmaster(4)}-{i}".encode()).hexdigest(),
                16,
            )
            planet_name = generate_name(planet_seed, "planet")

            star_mass = self.constants.M_SUN
            if self.stars:
                star_type = self.stars[0]["Type"]
                mass_factors = {"Red Dwarf": 0.2, "Yellow Dwarf": 1.0, "Blue Giant": 10.0, "Red Giant": 1.2, "White Dwarf": 0.6, "Neutron Star": 1.4}  # 0.08-0.45 solar masses  # ~1 solar mass (like our Sun)  # 2-50+ solar masses  # 0.3-8 solar masses (evolved stars)  # 0.5-1.4 solar masses  # 1.1-2.2 solar masses
                star_mass *= mass_factors.get(star_type, 1.0)

            self.planets[i] = Planet(planet_seed, planet_name, self.constants, star_mass)

        extra_planet_probabilities = {
            6: 0.35,
            7: 0.25,
            8: 0.10,
            9: 0.05,
            # Beyond ten planets, a frontier world (one of the FRONTIER_TYPES)
            10: 0.30,
        }

        for extra_planet_index, probability in extra_planet_probabilities.items():
            if self.num_planets != extra_planet_index:
                break

            extra_seed = int(
                hashlib.sha256(f"{self.seed}-extra-planet-{extra_planet_index}".encode()).hexdigest(),
                16,
            )

            random.seed(extra_seed)

            if random.random() < probability:
                from pymodules.__universe_init_planet import Planet, FRONTIER_TYPES, FRONTIER_SLOTS

                # The 11th planet's type comes from one of FRONTIER_SLOTS slots; one with no
                # type yet means no 11th planet
                frontier_type = None
                if extra_planet_index == 10:
                    slot = random.randint(1, FRONTIER_SLOTS)
                    if slot > len(FRONTIER_TYPES):
                        break
                    frontier_type = FRONTIER_TYPES[slot - 1]

                planet_seed = int(
                    hashlib.sha256(f"{self.seed}-{seedmaster(4)}-{extra_planet_index}".encode()).hexdigest(),
                    16,
                )
                planet_name = generate_name(planet_seed, "planet", is_extra=True)

                star_mass = self.constants.M_SUN
                if self.stars:
                    star_type = self.stars[0]["Type"]
                    mass_factors = {
                        "Red Dwarf": 0.2,
                        "Yellow Dwarf": 1.0,
                        "Blue Giant": 10.0,
                        "Red Giant": 1.2,
                        "White Dwarf": 0.6,
                        "Neutron Star": 1.4,
                    }
                    star_mass *= mass_factors.get(star_type, 1.0)

                self.planets[extra_planet_index] = Planet(planet_seed, planet_name, self.constants, star_mass, frontier_type=frontier_type)
                self.num_planets = extra_planet_index + 1
            else:
                break

    def determine_star_system_type(self):
        system_type = random.choices(
            ["single", "binary", "tertiary"],
            weights=[0.7, 0.25, 0.05],
            k=1,
        )[0]
        return system_type

    def generate_stars(self):
        star_count = 1 if self.star_system_type == "single" else 2 if self.star_system_type == "binary" else 3
        stars = []
        for i in range(star_count):
            star_seed = int(
                hashlib.sha256(f"{self.seed}-{seedmaster(2)}-{i}".encode()).hexdigest(),
                16,
            )
            stars.append(self.generate_star(star_seed))
        return stars

    def generate_star(self, seed):
        random.seed(seed)

        star_types = {
            "Red Dwarf": {"color": "red", "radius_factor": 0.5},
            "Yellow Dwarf": {"color": "yellow", "radius_factor": 1.0},
            "Blue Giant": {"color": "blue", "radius_factor": 2.0},
            "Red Giant": {"color": "orange", "radius_factor": 3.0},
            "White Dwarf": {"color": "white", "radius_factor": 0.3},
            "Neutron Star": {"color": "purple", "radius_factor": 0.2},
        }

        star_type = random.choice(list(star_types.keys()))
        star_properties = star_types[star_type]

        return {
            "Type": star_type,
            "Color": star_properties["color"],
            "Radius Factor": star_properties["radius_factor"],
        }

    def get_planet(self, index):
        return self.planets.get(index, None)
