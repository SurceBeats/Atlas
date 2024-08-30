# universe.py

import hashlib
import random
import math
import time

from pymodules.__name_generator import generate_name
from pymodules.__planet_generator import generate_planet
from pymodules.__seedmaster import seedmaster
from pymodules.__config import cosmic_origin_time


class Universe:
    def __init__(self, seed, constants):
        self.seed = seed
        self.constants = constants
        self.galaxies = {}

    def get_galaxy(self, x, y, z):
        max_coordinate = 10**7
        if not (
            0 <= x <= max_coordinate
            and 0 <= y <= max_coordinate
            and 0 <= z <= max_coordinate
        ):
            raise ValueError(
                f"Coordinates out of range. Must be between 0 and {max_coordinate}."
            )

        if (x, y, z) not in self.galaxies:
            galaxy_seed = int(
                hashlib.sha256(
                    f"{self.seed}-{seedmaster(12)}-{x}-{y}-{z}".encode()
                ).hexdigest(),
                16,
            )
            galaxy_name = generate_name(galaxy_seed, "galaxy")
            galaxy_type = random.choice(["Dwarf", "Spiral", "Elliptical"])

            self.galaxies[(x, y, z)] = Galaxy(
                galaxy_seed,
                galaxy_name,
                self.constants,
                galaxy_type,
                coordinates=(x, y, z),
                cosmic_origin_time=cosmic_origin_time,
            )
        return self.galaxies[(x, y, z)]


class Galaxy:
    def __init__(
        self,
        seed,
        name,
        constants,
        galaxy_type="spiral",
        coordinates=(0, 0, 0),
        cosmic_origin_time=None,
    ):
        self.seed = seed
        self.name = name
        self.constants = constants
        self.coordinates = coordinates
        self.galaxy_type = galaxy_type
        self.cosmic_origin_time = cosmic_origin_time
        random.seed(seed)

        if self.galaxy_type == "Dwarf":
            self.base_min_systems = 500
            self.base_max_systems = random.randint(10**5, 10**7)
        elif self.galaxy_type == "Spiral":
            self.base_min_systems = 1500
            self.base_max_systems = random.randint(10**9, 5 * 10**10)
        elif self.galaxy_type == "Elliptical":
            self.base_min_systems = 5000
            self.base_max_systems = random.randint(10**10, 10**11)
        else:
            self.base_min_systems = 3500
            self.base_max_systems = random.randint(10**8, 10**9)

        # Centro del universo 4999999^*3
        self.distance_to_origin = math.sqrt(
            (self.coordinates[0] - 4999999) ** 2
            + (self.coordinates[1] - 4999999) ** 2
            + (self.coordinates[2] - 4999999) ** 2
        )

        self.max_distance = math.sqrt(3 * (4999999**2))

        self.proximity_factor = max(
            0, 1 - (self.distance_to_origin / self.max_distance)
        )

        self.calculate_num_systems()

        self.solar_systems = {}

        if self.num_systems <= 0:
            self.galaxy_type = "Singularity Void"
            self.black_holes = 0
            self.pulsars = 0
            self.quasars = 0
        else:
            self.black_holes = random.randint(1, 10)
            self.pulsars = random.randint(0, 50)
            self.quasars = random.randint(0, 2)

    def calculate_num_systems(self):
        tiempo_transcurrido = time.time() - self.cosmic_origin_time
        minutos_transcurridos = tiempo_transcurrido // 60

        growth_systems = int(minutos_transcurridos * self.proximity_factor * 10)

        base_num_systems = int(
            self.base_min_systems
            + (self.base_max_systems - self.base_min_systems) * self.proximity_factor
        )

        self.num_systems = max(
            min(base_num_systems + growth_systems, self.base_max_systems), 0
        )

    def get_solar_system(self, index):
        self.calculate_num_systems()
        if index < 0 or index >= self.num_systems:
            raise ValueError(
                f"Solar System index out of range. Must be between 0 and {self.num_systems - 1}."
            )
        if index not in self.solar_systems:
            system_seed = int(
                hashlib.sha256(
                    f"{self.seed}-{seedmaster(8)}-{index}".encode()
                ).hexdigest(),
                16,
            )
            self.solar_systems[index] = SolarSystem(system_seed, index, self.constants)
        return self.solar_systems[index]


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
            planet_seed = int(
                hashlib.sha256(f"{self.seed}-{seedmaster(4)}-{i}".encode()).hexdigest(),
                16,
            )
            planet_name = generate_name(planet_seed, "planet")
            self.planets[i] = generate_planet(planet_seed, planet_name, self.constants)

    def determine_star_system_type(self):
        system_type = random.choices(
            ["single", "binary", "tertiary"],
            weights=[0.7, 0.25, 0.05],
            k=1,
        )[0]
        return system_type

    def generate_stars(self):
        star_count = (
            1
            if self.star_system_type == "single"
            else 2 if self.star_system_type == "binary" else 3
        )
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
