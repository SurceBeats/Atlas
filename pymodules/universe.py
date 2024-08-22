# pymodules/universe.py

import random
from pymodules.naming import generate_name
from pymodules.planet import generate_planet


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
            galaxy_seed = hash((self.seed, x, y, z))
            galaxy_name = generate_name(galaxy_seed, "galaxy")
            galaxy_type = random.choice(["dwarf", "spiral", "elliptical"])

            self.galaxies[(x, y, z)] = Galaxy(
                galaxy_seed,
                galaxy_name,
                self.constants,
                galaxy_type,
                coordinates=(x, y, z),
            )
        return self.galaxies[(x, y, z)]


class Galaxy:
    def __init__(
        self, seed, name, constants, galaxy_type="spiral", coordinates=(0, 0, 0)
    ):
        self.seed = seed
        self.name = name
        self.constants = constants
        self.coordinates = coordinates
        self.galaxy_type = galaxy_type
        random.seed(seed)

        if self.galaxy_type == "dwarf":
            self.num_systems = random.randint(10**5, 10**7)
        elif self.galaxy_type == "spiral":
            self.num_systems = random.randint(10**9, 5 * 10**10)
        elif self.galaxy_type == "elliptical":
            self.num_systems = random.randint(10**10, 10**11)
        else:
            self.num_systems = random.randint(10**8, 10**9)

        self.solar_systems = {}

        self.black_holes = random.randint(1, 10)
        self.pulsars = random.randint(0, 50)
        self.quasars = random.randint(0, 2)

    def get_solar_system(self, index):
        if index < 0 or index >= self.num_systems:
            raise ValueError(
                f"Solar System index out of range. Must be between 0 and {self.num_systems - 1}."
            )
        if index not in self.solar_systems:
            system_seed = hash((self.seed, index))
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
            planet_seed = hash((self.seed, i))
            planet_name = generate_name(planet_seed, "planet")
            self.planets[i] = generate_planet(planet_seed, planet_name, self.constants)

    def determine_star_system_type(self):
        """Determina si el sistema es simple, binario o terciario."""
        system_type = random.choices(
            ["single", "binary", "tertiary"],
            weights=[0.7, 0.25, 0.05],
            k=1,
        )[0]
        return system_type

    def generate_stars(self):
        """Genera las estrellas del sistema solar."""
        star_count = (
            1
            if self.star_system_type == "single"
            else 2 if self.star_system_type == "binary" else 3
        )
        stars = []
        for i in range(star_count):
            star_seed = self.seed + i
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
