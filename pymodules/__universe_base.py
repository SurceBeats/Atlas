# pymodules/__universe_base.py

import math
import time
import random
import hashlib

from pymodules.__atlas_seedmaster import seedmaster
from pymodules.__atlas_config import config

from pymodules.__universe_name_generator import generate_name
from pymodules.__universe_elements import periodic_table


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
                cosmic_origin_time=config.cosmic_origin_time,
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

        self.distance_to_origin = math.sqrt(
            (self.coordinates[0] - 4999999) ** 2
            + (self.coordinates[1] - 4999999) ** 2
            + (self.coordinates[2] - 4999999) ** 2
        )

        self.max_distance = math.sqrt(3 * (4999999**2))

        self.proximity_factor = max(
            0, 1 - (self.distance_to_origin / self.max_distance)
        )

        if cosmic_origin_time - time.time() >= 59999997000000:
            self.num_systems = 0
            self.galaxy_type = "Singularity Void"
            self.black_holes = 0
            self.pulsars = 0
            self.quasars = 0
        else:
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

            self.planets[i] = Planet(planet_seed, planet_name, self.constants)

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


class Planet:
    def __init__(self, seed, name, constants):
        self.seed = seed
        self.name = name
        self.constants = constants

        self.initialize_planet_attributes()

    def initialize_planet_attributes(self):

        planet_seed = self.generate_planet_seed()
        random.seed(planet_seed)

        self.planet_type = self.choose_planet_type()
        self.atmosphere = self.choose_atmosphere()
        self.diameter, self.volume = self.calculate_diameter_and_volume()
        self.density = self.calculate_density()
        self.surface_temperature = self.calculate_surface_temperature()
        self.possible_elements = self.calculate_possible_elements()
        self.k2_planet, self.Q_planet, self.base_rotation_seconds = (
            self.calculate_internal_factors()
        )
        self.k_factor = self.calculate_k_factor()
        self.mass = self.calculate_mass()
        self.gravity = self.calculate_gravity()
        self.orbital_radius, self.orbital_radius_m = self.calculate_orbital_radius()
        self.orbital_period_seconds = self.calculate_orbital_period()
        self.orbital_speed = self.calculate_orbital_speed()
        self.tidal_effect = self.calculate_tidal_effect()
        self.moment_of_inertia = self.calculate_moment_of_inertia()
        self.axial_tilt = self.calculate_axial_tilt()
        self.eccentricity_factor = self.calculate_eccentricity_factor()
        self.rotation_period_seconds = self.calculate_rotation_period()
        self.elements = self.generate_elements_for_planet(planet_seed)
        self.life_forms = self.calculate_life_probability()
        self.planet_rings = self.decide_planet_rings(planet_seed)
        self.initial_angle_rotation = random.uniform(0, 2 * math.pi)
        self.initial_orbital_angle = random.uniform(0, 2 * math.pi)

    def generate_planet_seed(self):
        return int(
            hashlib.sha256(
                f"{self.seed}-{self.name}-{seedmaster(4)}".encode()
            ).hexdigest(),
            16,
        )

    def choose_planet_type(self):
        return random.choice(
            [
                "Rocky",
                "Gas Giant",
                "Icy",
                "Oceanic",
                "Desert",
                "Lava",
                "Arid",
                "Tundra",
                "Swamp",
                "Forest",
                "Savannah",
                "Cave",
                "Crystalline",
                "Anomaly",
                "Metallic",
                "Toxic",
                "Radioactive",
                "Magma",
                "Molten Core",
                "Carbon",
                "Diamond",
                "Super Earth",
                "Sub Earth",
                "Frozen Gas Giant",
                "Nebulous",
                "Aquifer",
                "Exotic",
            ]
        )

    def choose_atmosphere(self):
        if self.planet_type in ["Gas Giant", "Frozen Gas Giant", "Nebulous", "Anomaly"]:
            possible_atmospheres = [
                "Hydrogen",
                "Helium",
                "Methane",
                "Ammonia",
                "Carbon Dioxide",
                "Toxic",
                "Ionic",
                "Plasma",
                "Exotic Gases",
                "Water Vapor",
            ]
        elif self.planet_type in [
            "Rocky",
            "Oceanic",
            "Desert",
            "Lava",
            "Arid",
            "Tundra",
            "Swamp",
        ]:
            possible_atmospheres = [
                "Thick",
                "Thin",
                "None",
                "Breathable",
                "Carbon Dioxide",
                "Methane",
                "Nitrogen",
                "Oxygen-Rich",
                "Sulfur Dioxide",
                "Superheated",
                "Acidic",
            ]
        else:
            possible_atmospheres = [
                "Exotic Gases",
                "Plasma",
                "Ionic",
                "None",
                "Frozen",
                "Acidic",
                "Toxic",
                "Superheated",
                "Hydrogen",
                "Helium",
            ]
        return random.choice(possible_atmospheres)

    def generate_elements_for_planet(self, seed):
        elements, weights = zip(*periodic_table)

        random.seed(seed)

        possible_elements = self.possible_elements

        preselected_elements = random.sample(
            possible_elements, min(2, len(possible_elements))
        )

        remaining_elements = [el for el in elements if el not in preselected_elements]
        remaining_weights = [
            weights[i]
            for i, el in enumerate(elements)
            if el not in preselected_elements
        ]

        total_elements = random.randint(5, 10)

        num_elements_to_select = total_elements - len(preselected_elements)

        num_elements_to_select = min(num_elements_to_select, len(remaining_elements))

        additional_elements = []
        while len(additional_elements) < num_elements_to_select and remaining_elements:
            selected_element = random.choices(
                remaining_elements, weights=remaining_weights, k=1
            )[0]
            additional_elements.append(selected_element)

            index = remaining_elements.index(selected_element)
            remaining_elements.pop(index)
            remaining_weights.pop(index)

        selected_elements = preselected_elements + additional_elements

        return selected_elements

    def calculate_possible_elements(self):
        elements_mapping = {
            "Rocky": ["Silicon", "Iron", "Magnesium", "Oxygen"],
            "Gas Giant": ["Hydrogen", "Helium", "Neon", "Argon"],
            "Icy": ["Nitrogen", "Oxygen", "Hydrogen", "Sulfur"],
            "Oceanic": ["Oxygen", "Hydrogen", "Sodium", "Chlorine"],
            "Desert": ["Silicon", "Oxygen", "Iron", "Aluminum"],
            "Lava": ["Magnesium", "Silicon", "Iron", "Sulfur"],
            "Arid": ["Silicon", "Oxygen", "Iron", "Calcium"],
            "Tundra": ["Nitrogen", "Oxygen", "Carbon", "Iron"],
            "Swamp": ["Carbon", "Oxygen", "Phosphorus", "Nitrogen"],
            "Forest": ["Oxygen", "Carbon", "Nitrogen", "Phosphorus"],
            "Savannah": ["Oxygen", "Carbon", "Silicon", "Phosphorus"],
            "Cave": ["Silicon", "Calcium", "Iron", "Carbon"],
            "Crystalline": ["Silicon", "Carbon", "Oxygen", "Iron"],
            "Anomaly": ["Copernicium", "Nihonium", "Flerovium", "Moscovium"],
            "Metallic": ["Iron", "Nickel", "Titanium", "Cobalt"],
            "Toxic": ["Sulfur", "Chlorine", "Phosphorus", "Fluorine"],
            "Radioactive": ["Uranium", "Thorium", "Plutonium", "Radium"],
            "Magma": ["Magnesium", "Silicon", "Iron", "Sulfur"],
            "Molten Core": ["Iron", "Nickel", "Magnesium", "Sulfur"],
            "Carbon": ["Carbon", "Oxygen", "Silicon", "Iron"],
            "Diamond": ["Carbon", "Silicon", "Nitrogen", "Oxygen"],
            "Super Earth": ["Iron", "Magnesium", "Silicon", "Oxygen"],
            "Sub Earth": ["Silicon", "Iron", "Carbon", "Oxygen"],
            "Frozen Gas Giant": ["Hydrogen", "Helium", "Neon", "Methane"],
            "Nebulous": ["Hydrogen", "Helium", "Neon", "Argon"],
            "Aquifer": ["Oxygen", "Hydrogen", "Sodium", "Chlorine"],
            "Exotic": ["Oganesson", "Livermorium", "Tennessine", "Flerovium"],
        }

        possible_elements = elements_mapping.get(
            self.planet_type,
            [elem for elem, prob in periodic_table if prob > 0.0000000001],
        )

        return possible_elements

    def calculate_diameter_and_volume(self):
        diameter_ranges = {
            "Rocky": (0.7, 1.2),
            "Gas Giant": (10, 15),
            "Icy": (0.7, 1.5),
            "Oceanic": (0.8, 1.5),
            "Desert": (0.7, 1.2),
            "Lava": (0.8, 1.5),
            "Arid": (0.7, 1.2),
            "Tundra": (0.7, 1.5),
            "Swamp": (0.8, 1.5),
            "Forest": (0.8, 1.5),
            "Savannah": (0.8, 1.5),
            "Cave": (0.7, 1.2),
            "Crystalline": (0.7, 1.2),
            "Anomaly": (0.1, 3),
            "Metallic": (1, 2.5),
            "Toxic": (0.7, 1.5),
            "Radioactive": (1, 2),
            "Magma": (0.8, 1.5),
            "Molten Core": (0.8, 1.5),
            "Carbon": (0.7, 1.5),
            "Diamond": (0.7, 1.5),
            "Super Earth": (1, 2),
            "Sub Earth": (0.5, 1),
            "Frozen Gas Giant": (10, 15),
            "Nebulous": (5, 15),
            "Aquifer": (0.8, 1.5),
            "Exotic": (0.5, 3),
        }

        diameter_range = diameter_ranges.get(self.planet_type, (0.5, 2))

        diameter = random.uniform(*diameter_range) * self.constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3

        return diameter, volume

    def calculate_life_probability(self):
        score = 0

        if -20 <= self.surface_temperature <= 50:
            score += 20
        elif (
            -100 <= self.surface_temperature < -20
            or 50 < self.surface_temperature <= 100
        ):
            score += 10
        else:
            score -= 20

        if self.atmosphere in ["Oxygen-Rich", "Nitrogen"]:
            score += 30
        elif self.atmosphere in ["Carbon Dioxide", "Methane"]:
            score += 10
        else:
            score -= 10

        if self.planet_type in ["Oceanic", "Swamp", "Aquifer"]:
            score += 30
        elif self.planet_type in ["Rocky", "Forest", "Savannah"]:
            score += 20
        elif self.planet_type in ["Gas Giant", "Frozen Gas Giant"]:
            score -= 10

        if "Water" in self.elements:
            score += 20
        if "Carbon" in self.elements:
            score += 10
        if "Silicon" in self.elements:
            score += 5

        possible_life_forms = ["None"]

        if score >= 60:
            possible_life_forms.extend(
                [
                    "Intelligent Life",
                    "Animal Life",
                    "Vegetation",
                    "Bacteria",
                    "Vegetable Animals",
                ]
            )
            if random.random() < 0.0005:
                return "Vegetable Animals"
        elif 40 <= score < 60:
            possible_life_forms.extend(["Animal Life", "Vegetation", "Bacteria"])
        elif 20 <= score < 40:
            possible_life_forms.extend(["Bacteria", "Vegetation"])

        if "Silicon" in self.elements:
            if random.random() < 0.02:
                return "Silicon-Based Life"

        if random.random() < 0.0001:
            return "Non-Physical Entity"

        if self.atmosphere in ["Methane", "Ammonia"]:
            if random.random() < 0.00001:
                return "Conscious Gas"

        if self.planet_type in ["Metallic", "Crystalline"]:
            if random.random() < 0.001:
                return "Robotic Entities"

        if (
            self.planet_type == "Nebulous"
            and self.atmosphere == "Plasma"
            and "Moscovium" in self.elements
            and "Z-Divinium" in self.elements
        ):
            if random.random() < 0.00001:
                return "Have I just found God?"

        return random.choice(possible_life_forms)

    def calculate_density(self):
        density_ranges = {
            "Rocky": (3000, 5500),
            "Gas Giant": (500, 1600),
            "Icy": (500, 2000),
            "Oceanic": (1000, 3000),
            "Desert": (2000, 4000),
            "Lava": (3000, 5000),
            "Arid": (2000, 4000),
            "Tundra": (1500, 3000),
            "Swamp": (1000, 3000),
            "Forest": (1000, 3000),
            "Savannah": (1000, 3000),
            "Cave": (2000, 4000),
            "Crystalline": (2000, 4000),
            "Anomaly": (500, 10000),
            "Metallic": (5000, 8000),
            "Toxic": (3000, 6000),
            "Radioactive": (4000, 7000),
            "Magma": (4000, 7000),
            "Molten Core": (5000, 8000),
            "Carbon": (3500, 5000),
            "Diamond": (3000, 7000),
            "Super Earth": (4000, 6000),
            "Sub Earth": (3000, 5000),
            "Frozen Gas Giant": (500, 1000),
            "Nebulous": (100, 300),
            "Aquifer": (2000, 3000),
            "Exotic": (1000, 20000),
        }

        density_range = density_ranges.get(self.planet_type, (3000, 6000))

        return random.uniform(*density_range)

    def calculate_tidal_effect(self):

        tidal_effect = (
            (
                3
                * self.constants.G
                * self.k2_planet
                * self.constants.M_SUN**2
                * (self.diameter * 1e3 / 2) ** 5
            )
            / (2 * self.Q_planet * self.orbital_radius_m**6 * self.mass)
        ) * self.orbital_period_seconds

        if self.orbital_radius > 1:
            tidal_effect *= 0.1

        return tidal_effect

    def calculate_surface_temperature(self):
        temperature_ranges = {
            "Rocky": (-150, 50),
            "Gas Giant": (-150, 150),
            "Icy": (-150, 0),
            "Oceanic": (0, 40),
            "Desert": (50, 200),
            "Lava": (500, 1200),
            "Arid": (50, 150),
            "Tundra": (-100, 0),
            "Swamp": (10, 50),
            "Forest": (10, 30),
            "Savannah": (20, 40),
            "Cave": (0, 40),
            "Crystalline": (-50, 500),
            "Anomaly": (-273, 1500),
            "Metallic": (-50, 400),
            "Toxic": (100, 400),
            "Radioactive": (-50, 500),
            "Magma": (700, 1500),
            "Molten Core": (1000, 2000),
            "Carbon": (-50, 300),
            "Diamond": (-50, 1000),
            "Super Earth": (-50, 400),
            "Sub Earth": (-100, 300),
            "Frozen Gas Giant": (-200, -50),
            "Nebulous": (-200, 50),
            "Aquifer": (-10, 50),
            "Exotic": (-273, 1500),
        }

        temperature_range = temperature_ranges.get(self.planet_type, (-100, 500))

        return random.uniform(*temperature_range)

    def calculate_internal_factors(self):
        internal_factors = {
            "Rocky": {
                "k2_planet": (0.2, 0.4),
                "Q_planet": (50, 200),
                "base_rotation_seconds": (0.5 * 3600, 12 * 3600),
            },
            "Gas Giant": {
                "k2_planet": (0.4, 0.6),
                "Q_planet": (10000, 1000000),
                "base_rotation_seconds": (2 * 3600, 6 * 3600),
            },
            "Icy": {
                "k2_planet": (0.3, 0.5),
                "Q_planet": (200, 600),
                "base_rotation_seconds": (1 * 3600, 8 * 3600),
            },
            "Oceanic": {
                "k2_planet": (0.2, 0.35),
                "Q_planet": (100, 300),
                "base_rotation_seconds": (0.5 * 3600, 5 * 3600),
            },
            "Desert": {
                "k2_planet": (0.25, 0.4),
                "Q_planet": (50, 200),
                "base_rotation_seconds": (1 * 3600, 8 * 3600),
            },
            "Lava": {
                "k2_planet": (0.3, 0.5),
                "Q_planet": (100, 400),
                "base_rotation_seconds": (2 * 3600, 11 * 3600),
            },
            "Arid": {
                "k2_planet": (0.25, 0.4),
                "Q_planet": (50, 200),
                "base_rotation_seconds": (1 * 3600, 10 * 3600),
            },
            "Tundra": {
                "k2_planet": (0.3, 0.5),
                "Q_planet": (100, 300),
                "base_rotation_seconds": (1 * 3600, 6 * 3600),
            },
            "Swamp": {
                "k2_planet": (0.2, 0.35),
                "Q_planet": (100, 300),
                "base_rotation_seconds": (0.8 * 3600, 7 * 3600),
            },
            "Forest": {
                "k2_planet": (0.2, 0.4),
                "Q_planet": (100, 300),
                "base_rotation_seconds": (1 * 3600, 6 * 3600),
            },
            "Savannah": {
                "k2_planet": (0.2, 0.4),
                "Q_planet": (100, 300),
                "base_rotation_seconds": (1 * 3600, 7 * 3600),
            },
            "Cave": {
                "k2_planet": (0.3, 0.5),
                "Q_planet": (200, 500),
                "base_rotation_seconds": (0.5 * 3600, 8 * 3600),
            },
            "Crystalline": {
                "k2_planet": (0.3, 0.6),
                "Q_planet": (1000, 5000),
                "base_rotation_seconds": (0.5 * 3600, 12 * 3600),
            },
            "Anomaly": {
                "k2_planet": (0.1, 0.8),
                "Q_planet": (1000, 10000000),
                "base_rotation_seconds": (0.1 * 3600, 100 * 3600),
            },
            "Metallic": {
                "k2_planet": (0.4, 0.7),
                "Q_planet": (500, 2000),
                "base_rotation_seconds": (2 * 3600, 12 * 3600),
            },
            "Toxic": {
                "k2_planet": (0.2, 0.5),
                "Q_planet": (100, 500),
                "base_rotation_seconds": (0.5 * 3600, 10 * 3600),
            },
            "Radioactive": {
                "k2_planet": (0.3, 0.6),
                "Q_planet": (500, 3000),
                "base_rotation_seconds": (1 * 3600, 20 * 3600),
            },
            "Magma": {
                "k2_planet": (0.3, 0.5),
                "Q_planet": (100, 400),
                "base_rotation_seconds": (3 * 3600, 15 * 3600),
            },
            "Molten Core": {
                "k2_planet": (0.4, 0.7),
                "Q_planet": (500, 2000),
                "base_rotation_seconds": (3 * 3600, 15 * 3600),
            },
            "Carbon": {
                "k2_planet": (0.3, 0.5),
                "Q_planet": (200, 600),
                "base_rotation_seconds": (1 * 3600, 8 * 3600),
            },
            "Diamond": {
                "k2_planet": (0.4, 0.6),
                "Q_planet": (500, 2000),
                "base_rotation_seconds": (2 * 3600, 12 * 3600),
            },
            "Super Earth": {
                "k2_planet": (0.4, 0.6),
                "Q_planet": (200, 400),
                "base_rotation_seconds": (0.5 * 3600, 10 * 3600),
            },
            "Sub Earth": {
                "k2_planet": (0.35, 0.5),
                "Q_planet": (150, 300),
                "base_rotation_seconds": (2 * 3600, 12 * 3600),
            },
            "Frozen Gas Giant": {
                "k2_planet": (0.4, 0.6),
                "Q_planet": (10000, 1000000),
                "base_rotation_seconds": (3 * 3600, 6 * 3600),
            },
            "Nebulous": {
                "k2_planet": (0.2, 0.5),
                "Q_planet": (1000, 5000),
                "base_rotation_seconds": (5 * 3600, 12 * 3600),
            },
            "Aquifer": {
                "k2_planet": (0.2, 0.4),
                "Q_planet": (100, 300),
                "base_rotation_seconds": (1 * 3600, 6 * 3600),
            },
            "Exotic": {
                "k2_planet": (0.1, 0.8),
                "Q_planet": (1000, 10000000),
                "base_rotation_seconds": (0.3 * 3600, 30 * 3600),
            },
            "default": {
                "k2_planet": (0.2, 0.7),
                "Q_planet": (50, 5000),
                "base_rotation_seconds": (5 * 3600, 50 * 3600),
            },
        }

        factors = internal_factors.get(self.planet_type, internal_factors["default"])

        base_rotation_seconds = random.uniform(*factors["base_rotation_seconds"])
        k2_planet = random.uniform(*factors["k2_planet"])
        Q_planet = random.uniform(*factors["Q_planet"])

        return k2_planet, Q_planet, base_rotation_seconds

    def calculate_k_factor(self):
        k_factor_map = {
            "Gas Giant": 0.4,
            "Frozen Gas Giant": 0.4,
            "Metallic": 0.35,
            "Radioactive": 0.35,
            "Magma": 0.35,
            "Molten Core": 0.35,
            "Carbon": 0.35,
            "Diamond": 0.35,
            "Crystalline": 0.5,
            "Anomaly": 0.5,
            "Exotic": 0.5,
        }

        return k_factor_map.get(self.planet_type, 0.3)

    def calculate_mass(self):
        return self.density * self.volume

    def calculate_gravity(self):
        return self.constants.G * (self.mass / (self.diameter * 1e3 / 2) ** 2)

    def calculate_orbital_radius(self):
        orbital_radius = random.uniform(0.1, 40)
        orbital_radius_m = orbital_radius * 1.496e11
        return orbital_radius, orbital_radius_m

    def calculate_orbital_period(self):
        return (
            2
            * math.pi
            * math.sqrt(
                self.orbital_radius_m**3 / (self.constants.G * self.constants.M_SUN)
            )
        )

    def calculate_orbital_speed(self):
        return math.sqrt(
            self.constants.G * self.constants.M_SUN / self.orbital_radius_m
        )

    def calculate_axial_tilt(self):
        return random.uniform(0, 45)

    def calculate_moment_of_inertia(self):
        return self.k_factor * self.mass * (self.diameter * 1e3 / 2) ** 2

    def calculate_rotation_period(self):
        rotation_period_seconds = self.base_rotation_seconds * math.sqrt(
            self.moment_of_inertia / (self.mass * self.gravity * self.diameter * 1e3)
        )

        if self.orbital_radius > 1:
            self.tidal_effect *= 0.1

        rotation_period_seconds /= max(1, self.tidal_effect)

        eccentricity_factor = random.uniform(0.8, 1.2)
        distance_influence = (1 / (self.orbital_radius**1.5)) * random.uniform(0.9, 1.1)
        rotation_period_seconds *= max(1, eccentricity_factor * distance_influence)

        if (
            self.orbital_radius < 1.0
            and rotation_period_seconds > 365 * 24 * 3600
            and rotation_period_seconds > 2 * self.orbital_period_seconds
        ):
            divisor = 2 + (1 - self.orbital_radius) * 10
            rotation_period_seconds = random.uniform(
                6 * 3600, rotation_period_seconds / divisor
            )

        min_rotation_period = 0.1 * 3600

        return max(min_rotation_period, rotation_period_seconds)

    def calculate_eccentricity_factor(self):
        return random.uniform(0, 0.5)

    def decide_planet_rings(self, seed):
        random.seed(seed)

        roche_limit = (
            2.44 * (self.diameter * 1e3 / 2) * (self.density / 3000) ** (1 / 3)
        )
        orbital_radius_km = self.orbital_radius_m / 1e6

        if orbital_radius_km > roche_limit:
            return False

        gravity_factor = self.gravity / 9.81
        mass_factor = self.mass / self.constants.M_EARTH
        rotation_factor = min(1.5, 1 / (self.rotation_period_seconds / 86400))
        temperature_factor = 1 / (
            1 + math.exp(-0.001 * (self.surface_temperature - 150))
        )
        axial_tilt_factor = 1 - (self.axial_tilt / 90)

        ring_probability = (
            mass_factor
            * gravity_factor
            * rotation_factor
            * axial_tilt_factor
            * temperature_factor
        ) * 20
        ring_probability = min(ring_probability, 7)

        decision = random.uniform(0, 100) <= ring_probability
        return decision
