# planet.py

import hashlib
import random
import math

from pymodules.__periodic_table_prob import periodic_table
from pymodules.__seedmaster import seedmaster


def calculate_life_probability(planet):
    score = 0

    if -20 <= planet["Surface Temperature"] <= 50:
        score += 20
    elif (
        -100 <= planet["Surface Temperature"] < -20
        or 50 < planet["Surface Temperature"] <= 100
    ):
        score += 10
    else:
        score -= 20

    if planet["Atmosphere"] in ["Oxygen-Rich", "Nitrogen"]:
        score += 30
    elif planet["Atmosphere"] in ["Carbon Dioxide", "Methane"]:
        score += 10
    else:
        score -= 10

    if planet["Type"] in ["Oceanic", "Swamp", "Aquifer"]:
        score += 30
    elif planet["Type"] in ["Rocky", "Forest", "Savannah"]:
        score += 20
    elif planet["Type"] in ["Gas Giant", "Frozen Gas Giant"]:
        score -= 10

    if "Water" in planet["Elements"]:
        score += 20
    if "Carbon" in planet["Elements"]:
        score += 10
    if "Silicon" in planet["Elements"]:
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

    if "Silicon" in planet["Elements"]:
        if random.random() < 0.02:
            return "Silicon-Based Life"
    if random.random() < 0.0001:
        return "Non-Physical Entity"
    if planet["Atmosphere"] in ["Methane", "Ammonia"]:
        if random.random() < 0.00001:
            return "Conscious Gas"
    if planet["Type"] in ["Metallic", "Crystalline"]:
        if random.random() < 0.001:
            return "Robotic Entities"
    if (
        planet["Type"] == "Nebulous"
        and planet["Atmosphere"] == "Plasma"
        and "Moscovium" in planet["Elements"]
        and "Divinium" in planet["Elements"]
    ):
        if random.random() < 1111111111111:
            return "Have I just found God?"

    return random.choice(possible_life_forms)


def generate_elements_for_planet(possible_elements):
    elements, weights = zip(*periodic_table)
    if random.random() < 0.01:
        dominant_element = random.choices(elements, weights=weights, k=1)[0]
        return [dominant_element] * random.randint(5, 10)
    selected_elements = random.sample(
        possible_elements, k=min(len(possible_elements), random.randint(2, 10))
    )
    return selected_elements


def generate_planet(seed, name, constants):

    planet_seed = int(
        hashlib.sha256(f"{seed}-{seedmaster(4)}".encode()).hexdigest(), 16
    )
    random.seed(planet_seed)

    planet_type = random.choice(
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

    if planet_type in ["Gas Giant", "Frozen Gas Giant", "Nebulous", "Anomaly"]:
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
    elif planet_type in [
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

    atmosphere = random.choice(possible_atmospheres)
    if planet_type == "Gas Giant":
        mass = random.uniform(100, 300) * constants.M_EARTH
        diameter = random.uniform(10, 15) * constants.D_EARTH
        density = mass / ((4 / 3) * math.pi * (diameter / 2) ** 3) * 0.5
        surface_temperature = random.uniform(-150, 100)
        possible_elements = ["Hydrogen", "Helium", "Methane", "Ammonia"]
    elif planet_type == "Icy":
        mass = random.uniform(0.5, 5) * constants.M_EARTH
        diameter = random.uniform(0.5, 2) * constants.D_EARTH
        density = mass / ((4 / 3) * math.pi * (diameter / 2) ** 3)
        surface_temperature = random.uniform(-200, 0)
        possible_elements = ["Water", "Ammonia", "Methane", "Nitrogen"]
    elif planet_type == "Anomaly":
        mass = random.uniform(0.01, 50) * constants.M_EARTH
        diameter = random.uniform(0.1, 3) * constants.D_EARTH
        density = mass / ((4 / 3) * math.pi * (diameter / 2) ** 3)
        surface_temperature = random.uniform(-273, 1500)
        possible_elements = ["Copernicium", "Nihonium", "Flerovium", "Moscovium"]
    elif planet_type == "Lava":
        mass = random.uniform(0.5, 5) * constants.M_EARTH
        diameter = random.uniform(0.7, 2.5) * constants.D_EARTH
        density = mass / ((4 / 3) * math.pi * (diameter / 2) ** 3)
        surface_temperature = random.uniform(500, 1200)
        possible_elements = ["Magnesium", "Silicon", "Iron"]
    elif planet_type == "Oceanic":
        mass = random.uniform(0.5, 5) * constants.M_EARTH
        diameter = random.uniform(0.8, 2) * constants.D_EARTH
        density = mass / ((4 / 3) * math.pi * (diameter / 2) ** 3) * 1.1
        surface_temperature = random.uniform(-10, 50)
        possible_elements = ["Water", "Oxygen", "Carbon Dioxide"]
    elif planet_type == "Desert":
        mass = random.uniform(0.3, 5) * constants.M_EARTH
        diameter = random.uniform(0.7, 2) * constants.D_EARTH
        density = mass / ((4 / 3) * math.pi * (diameter / 2) ** 3)
        surface_temperature = random.uniform(50, 200)
        possible_elements = ["Silicon", "Oxygen", "Iron"]
    elif planet_type == "Swamp":
        mass = random.uniform(0.5, 5) * constants.M_EARTH
        diameter = random.uniform(0.8, 2) * constants.D_EARTH
        density = mass / ((4 / 3) * math.pi * (diameter / 2) ** 3)
        surface_temperature = random.uniform(10, 50)
        possible_elements = ["Water", "Carbon", "Oxygen", "Phosphorus"]
    else:
        mass = random.uniform(0.1, 10) * constants.M_EARTH
        diameter = random.uniform(0.5, 2) * constants.D_EARTH
        density = mass / ((4 / 3) * math.pi * (diameter / 2) ** 3)
        surface_temperature = random.uniform(-100, 500)
        possible_elements = [
            elem for elem, prob in periodic_table if prob > 0.0000000001
        ]

    gravity = constants.G * (mass / (diameter / 2) ** 2)

    orbital_radius = random.uniform(0.1, 40)
    orbital_period_seconds = (
        2
        * math.pi
        * math.sqrt((orbital_radius * 1.496e11) ** 3 / (constants.G * constants.M_SUN))
    )
    orbital_period_years = orbital_period_seconds / (60 * 60 * 24 * 365.25)

    orbital_speed = (constants.G * constants.M_SUN / (orbital_radius * 1.496e11)) ** 0.5

    axial_tilt = random.uniform(0, 90)

    tidal_effect = (
        constants.G * constants.M_SUN / (orbital_radius * 1.496e11) ** 2
    ) ** 0.5
    inertia_effect = (mass / constants.M_EARTH) ** 0.25

    rotation_period = random.uniform(10, 1000) * inertia_effect / tidal_effect
    rotation_period = max(0.1, rotation_period)

    elements = generate_elements_for_planet(possible_elements)

    planet = {
        "Name": name,
        "Type": planet_type,
        "Atmosphere": atmosphere,
        "Mass": mass,
        "Diameter": diameter,
        "Density": density,
        "Gravity": gravity,
        "Orbital Radius": orbital_radius,
        "Orbital Period": orbital_period_years,
        "Orbital Speed": orbital_speed,
        "Axial Tilt": axial_tilt,
        "Rotation Period": rotation_period,
        "Elements": elements,
        "Surface Temperature": surface_temperature,
    }

    planet["Life Forms"] = calculate_life_probability(planet)

    return planet
