# pymodules/__universe_init_planet.py

import math
import time
import random
import hashlib

from pymodules.__atlas_seedmaster import seedmaster
from pymodules.__atlas_config import config
from pymodules.__universe_elements import periodic_table

# The types only an 11th planet (a frontier world, beyond a ten-planet system) can have;
# they behave as giant/gas planets. The system draws one of 8 slots for it (SolarSystem):
# slot n is FRONTIER_TYPES[n - 1], the rest mean no 11th planet yet, so new types are only
# ever appended, and adding one never changes an existing planet
FRONTIER_TYPES = ["Super Puff", "Super Ringed", "Mirror", "Ruby Cloud"]
FRONTIER_SLOTS = 8


class Planet:
    # frontier_type: the type an 11th planet was given by its system's slot, or None
    def __init__(self, seed, name, constants, star_mass=None, frontier_type=None):
        self.seed = seed
        self.name = name
        self.constants = constants
        self.star_mass = star_mass or constants.M_SUN
        self.frontier_type = frontier_type

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
        self.k2_planet, self.Q_planet, self.base_rotation_seconds = self.calculate_internal_factors()
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
        self.correct_temperature_orbital_distance()

        from pymodules.__universe_init_moons import MoonSystem

        self.moon_system = MoonSystem(self, self.star_mass)

    def generate_planet_seed(self):
        seedmaster_4 = seedmaster(4)
        seed_input = f"{self.seed}-{self.name}-{seedmaster_4}"
        seed_hex = hashlib.sha256(seed_input.encode()).hexdigest()
        seed_int = int(seed_hex, 16)
        return seed_int

    def choose_planet_type(self):
        # (no draw for a frontier type: a choice over a growing list would consume a
        # different number of bits and shift every other attribute when types are added)
        if self.frontier_type:
            return self.frontier_type
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
        if self.planet_type in ["Gas Giant", "Frozen Gas Giant", "Nebulous", "Anomaly", *FRONTIER_TYPES]:
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

        preselected_elements = random.sample(possible_elements, min(2, len(possible_elements)))

        remaining_elements = [el for el in elements if el not in preselected_elements]
        remaining_weights = [weights[i] for i, el in enumerate(elements) if el not in preselected_elements]

        total_elements = random.randint(5, 10)

        num_elements_to_select = total_elements - len(preselected_elements)

        num_elements_to_select = min(num_elements_to_select, len(remaining_elements))

        additional_elements = []
        while len(additional_elements) < num_elements_to_select and remaining_elements:
            selected_element = random.choices(remaining_elements, weights=remaining_weights, k=1)[0]
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
            "Frozen Gas Giant": ["Hydrogen", "Helium", "Neon", "Nitrogen"],
            "Nebulous": ["Hydrogen", "Helium", "Neon", "Argon"],
            "Aquifer": ["Oxygen", "Hydrogen", "Sodium", "Chlorine"],
            "Exotic": ["Oganesson", "Livermorium", "Tennessine", "Flerovium"],
            "Super Puff": ["Hydrogen", "Helium", "Carbon", "Nitrogen"],
            "Super Ringed": ["Hydrogen", "Helium", "Oxygen", "Silicon"],
            "Mirror": ["Titanium", "Silicon", "Oxygen", "Iron"],
            "Ruby Cloud": ["Aluminum", "Oxygen", "Chromium", "Titanium"],
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
            "Super Puff": (8, 14),
            "Super Ringed": (9, 13),
            "Mirror": (3.5, 5),
            "Ruby Cloud": (12, 22),
        }

        diameter_range = diameter_ranges.get(self.planet_type, (0.5, 2))

        diameter = random.uniform(*diameter_range) * self.constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3

        return diameter, volume

    def calculate_life_probability(self):
        score = 0

        if -20 <= self.surface_temperature <= 50:
            score += 20
        elif -100 <= self.surface_temperature < -20 or 50 < self.surface_temperature <= 100:
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
        elif self.planet_type in ["Gas Giant", "Frozen Gas Giant", *FRONTIER_TYPES]:
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

        if self.planet_type == "Nebulous" and self.atmosphere == "Plasma" and "Moscovium" in self.elements and "Z-Divinium" in self.elements:
            if random.random() < 0.1:
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
            "Super Puff": (20, 100),
            "Super Ringed": (600, 1400),
            "Mirror": (1500, 2500),
            "Ruby Cloud": (150, 500),
        }

        density_range = density_ranges.get(self.planet_type, (3000, 6000))

        return random.uniform(*density_range)

    def calculate_tidal_effect(self):

        tidal_effect = ((3 * self.constants.G * self.k2_planet * self.constants.M_SUN**2 * (self.diameter * 1e3 / 2) ** 5) / (2 * self.Q_planet * self.orbital_radius_m**6 * self.mass)) * self.orbital_period_seconds

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
            "Super Puff": (-100, 250),
            "Super Ringed": (-200, 0),
            "Mirror": (1600, 2200),
            "Ruby Cloud": (2000, 3000),
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
        # The frontier types are giants inside: the Gas Giant's tides and spin
        for planet_type in FRONTIER_TYPES:
            internal_factors[planet_type] = internal_factors["Gas Giant"]

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
            "Super Puff": 0.4,
            "Super Ringed": 0.4,
            "Mirror": 0.4,
            "Ruby Cloud": 0.4,
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
        return 2 * math.pi * math.sqrt(self.orbital_radius_m**3 / (self.constants.G * self.constants.M_SUN))

    def calculate_orbital_speed(self):
        return math.sqrt(self.constants.G * self.constants.M_SUN / self.orbital_radius_m)

    def calculate_axial_tilt(self):
        return random.uniform(0, 45)

    def calculate_moment_of_inertia(self):
        return self.k_factor * self.mass * (self.diameter * 1e3 / 2) ** 2

    def calculate_rotation_period(self):
        rotation_period_seconds = self.base_rotation_seconds * math.sqrt(self.moment_of_inertia / (self.mass * self.gravity * self.diameter * 1e3))

        if self.orbital_radius > 1:
            self.tidal_effect *= 0.1

        rotation_period_seconds /= max(1, self.tidal_effect)

        eccentricity_factor = self.eccentricity_factor

        distance_influence = (1 / (self.orbital_radius**1.5)) * random.uniform(0.9, 1.1)
        rotation_period_seconds *= max(1, eccentricity_factor * distance_influence)

        if self.orbital_radius < 1.0 and rotation_period_seconds > 365 * 24 * 3600 and rotation_period_seconds > 2 * self.orbital_period_seconds:
            divisor = 2 + (1 - self.orbital_radius) * 10
            rotation_period_seconds = random.uniform(6 * 3600, rotation_period_seconds / divisor)

        min_rotation_period = 0.1 * 3600

        return max(min_rotation_period, rotation_period_seconds)

    def calculate_eccentricity_factor(self):
        sigma = 0.15
        u1 = random.random()
        u2 = random.random()

        z = (-2 * math.log(u1 + 1e-10)) ** 0.5 * math.cos(2 * math.pi * u2)

        rayleigh = abs(z) * sigma

        eccentricity = min(rayleigh, 0.7)

        if random.random() < 0.05:
            eccentricity = random.uniform(0, 0.05)

        return eccentricity

    def decide_planet_rings(self, seed):
        random.seed(seed)

        # Its rings are what it is
        if self.planet_type == "Super Ringed":
            return True

        roche_limit = 2.44 * (self.diameter * 1e3 / 2) * (self.density / 3000) ** (1 / 3)
        orbital_radius_km = self.orbital_radius_m / 1e6

        if orbital_radius_km > roche_limit:
            return False

        gravity_factor = self.gravity / 9.81
        mass_factor = self.mass / self.constants.M_EARTH
        rotation_factor = min(1.5, 1 / (self.rotation_period_seconds / 86400))
        temperature_factor = 1 / (1 + math.exp(-0.001 * (self.surface_temperature - 150)))
        axial_tilt_factor = 1 - (self.axial_tilt / 90)

        ring_probability = (mass_factor * gravity_factor * rotation_factor * axial_tilt_factor * temperature_factor) * 20
        ring_probability = min(ring_probability, 7)

        random_roll = random.uniform(0, 100)
        decision = random_roll <= ring_probability

        return decision

    def correct_temperature_orbital_distance(self):
        current_time = time.time()

        # The type's temperature is the planet's mean, at its mean distance
        self.mean_temperature = self.surface_temperature

        atmosphere_factors = {
            "Thick": 1.2,
            "Thin": 0.9,
            "None": 0.7,
            "Breathable": 1.0,
            "Carbon Dioxide": 1.3,
            "Methane": 1.1,
            "Nitrogen": 0.95,
            "Oxygen-Rich": 1.0,
            "Sulfur Dioxide": 1.4,
            "Superheated": 1.6,
            "Acidic": 1.5,
            "Hydrogen": 1.2,
            "Helium": 0.8,
            "Ammonia": 1.1,
            "Water Vapor": 1.3,
            "Exotic Gases": random.uniform(0.8, 1.5),
            "Ionic": random.uniform(0.8, 1.3),
            "Plasma": random.uniform(1.0, 1.4),
            "Frozen": 0.5,
            "Toxic": 1.4,
        }

        self.atmosphere_factor = atmosphere_factors.get(self.atmosphere, 1.0)
        self.surface_temperature = self.temperature_at(current_time)

    # Its temperature at a moment (unix seconds) along its orbit: the clients work it out
    # the same way from mean_temperature and atmosphere_factor as their clock runs
    def temperature_at(self, unix_time):
        time_elapsed_seconds = unix_time - config.cosmic_origin_time

        orbital_period = self.orbital_period_seconds
        angle_velocity_orbit = 2 * math.pi / orbital_period

        angle_orbit = (self.initial_orbital_angle + time_elapsed_seconds * angle_velocity_orbit) % (2 * math.pi)

        semi_major_axis = self.orbital_radius
        eccentricity = self.eccentricity_factor
        current_distance = semi_major_axis * (1 - eccentricity**2) / (1 + eccentricity * math.cos(angle_orbit))

        if current_distance < 0.1:
            current_distance = 0.1

        # The mean temperature is at the mean distance; along the orbit radiative
        # equilibrium scales it, in kelvin, by sqrt(a/d)
        kelvin = self.mean_temperature + 273.15
        kelvin *= (semi_major_axis / current_distance) ** 0.5
        celsius = kelvin - 273.15

        atmosphere_factor = self.atmosphere_factor
        # Multiplies above 0 °C, divides below: a cold world never warms under a frozen sky
        celsius = celsius * atmosphere_factor if celsius >= 0 else celsius / atmosphere_factor
        # Nothing is colder than the cosmic background (2.7 K)
        return max(celsius, -270.45)
