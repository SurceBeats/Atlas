# pymodules\__planet_generator.py

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
        and "Z-Divinium" in planet["Elements"]
    ):
        if random.random() < 0.00001:
            return "Have I just found God?"

    return random.choice(possible_life_forms)


def generate_elements_for_planet(seed, possible_elements):
    elements, weights = zip(*periodic_table)

    random.seed(seed)

    preselected_elements = random.sample(
        possible_elements, min(2, len(possible_elements))
    )

    remaining_elements = [el for el in elements if el not in preselected_elements]
    remaining_weights = [
        weights[i] for i, el in enumerate(elements) if el not in preselected_elements
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


def generate_planet(seed, name, constants):

    planet_seed = int(
        hashlib.sha256(f"{seed}-{name}-{seedmaster(4)}".encode()).hexdigest(), 16
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

    if planet_type == "Rocky":
        diameter = random.uniform(0.7, 1.2) * constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3
        density = random.uniform(3000, 5500)
        surface_temperature = random.uniform(-150, 50)
        possible_elements = ["Silicon", "Iron", "Magnesium", "Oxygen"]
        base_rotation_seconds = random.uniform(0.5, 12) * 3600
        k2_planet = random.uniform(0.2, 0.4)
        Q_planet = random.uniform(50, 200)

    elif planet_type == "Gas Giant":
        diameter = random.uniform(10, 15) * constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3
        density = random.uniform(500, 1600)
        surface_temperature = random.uniform(-150, 150)
        possible_elements = ["Hydrogen", "Helium", "Neon", "Argon"]
        base_rotation_seconds = random.uniform(2, 6) * 3600
        k2_planet = random.uniform(0.4, 0.6)
        Q_planet = random.uniform(10000, 1000000)

    elif planet_type == "Icy":
        diameter = random.uniform(0.7, 1.5) * constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3
        density = random.uniform(500, 2000)
        surface_temperature = random.uniform(-150, 0)
        possible_elements = ["Nitrogen", "Oxygen", "Hydrogen", "Sulfur"]
        base_rotation_seconds = random.uniform(1, 8) * 3600
        k2_planet = random.uniform(0.3, 0.5)
        Q_planet = random.uniform(200, 600)

    elif planet_type == "Oceanic":
        diameter = random.uniform(0.8, 1.5) * constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3
        density = random.uniform(1000, 3000)
        surface_temperature = random.uniform(0, 40)
        possible_elements = ["Oxygen", "Hydrogen", "Sodium", "Chlorine"]
        base_rotation_seconds = random.uniform(0.5, 5) * 3600
        k2_planet = random.uniform(0.2, 0.35)
        Q_planet = random.uniform(100, 300)

    elif planet_type == "Desert":
        diameter = random.uniform(0.7, 1.2) * constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3
        density = random.uniform(2000, 4000)
        surface_temperature = random.uniform(50, 200)
        possible_elements = ["Silicon", "Oxygen", "Iron", "Aluminum"]
        base_rotation_seconds = random.uniform(1, 8) * 3600
        k2_planet = random.uniform(0.25, 0.4)
        Q_planet = random.uniform(50, 200)

    elif planet_type == "Lava":
        diameter = random.uniform(0.8, 1.5) * constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3
        density = random.uniform(3000, 5000)
        surface_temperature = random.uniform(500, 1200)
        possible_elements = ["Magnesium", "Silicon", "Iron", "Sulfur"]
        base_rotation_seconds = random.uniform(2, 11) * 3600
        k2_planet = random.uniform(0.3, 0.5)
        Q_planet = random.uniform(100, 400)

    elif planet_type == "Arid":
        diameter = random.uniform(0.7, 1.2) * constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3
        density = random.uniform(2000, 4000)
        surface_temperature = random.uniform(50, 150)
        possible_elements = ["Silicon", "Oxygen", "Iron", "Calcium"]
        base_rotation_seconds = random.uniform(1, 10) * 3600
        k2_planet = random.uniform(0.25, 0.4)
        Q_planet = random.uniform(50, 200)

    elif planet_type == "Tundra":
        diameter = random.uniform(0.7, 1.5) * constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3
        density = random.uniform(1500, 3000)
        surface_temperature = random.uniform(-100, 0)
        possible_elements = ["Nitrogen", "Oxygen", "Carbon", "Iron"]
        base_rotation_seconds = random.uniform(1, 6) * 3600
        k2_planet = random.uniform(0.3, 0.5)
        Q_planet = random.uniform(100, 300)

    elif planet_type == "Swamp":
        diameter = random.uniform(0.8, 1.5) * constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3
        density = random.uniform(1000, 3000)
        surface_temperature = random.uniform(10, 50)
        possible_elements = ["Carbon", "Oxygen", "Phosphorus", "Nitrogen"]
        base_rotation_seconds = random.uniform(0.8, 7) * 3600
        k2_planet = random.uniform(0.2, 0.35)
        Q_planet = random.uniform(100, 300)

    elif planet_type == "Forest":
        diameter = random.uniform(0.8, 1.5) * constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3
        density = random.uniform(1000, 3000)
        surface_temperature = random.uniform(10, 30)
        possible_elements = ["Oxygen", "Carbon", "Nitrogen", "Phosphorus"]
        base_rotation_seconds = random.uniform(1, 6) * 3600
        k2_planet = random.uniform(0.2, 0.4)
        Q_planet = random.uniform(100, 300)

    elif planet_type == "Savannah":
        diameter = random.uniform(0.8, 1.5) * constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3
        density = random.uniform(1000, 3000)
        surface_temperature = random.uniform(20, 40)
        possible_elements = ["Oxygen", "Carbon", "Silicon", "Phosphorus"]
        base_rotation_seconds = random.uniform(1, 7) * 3600
        k2_planet = random.uniform(0.2, 0.4)
        Q_planet = random.uniform(100, 300)

    elif planet_type == "Cave":
        diameter = random.uniform(0.7, 1.2) * constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3
        density = random.uniform(2000, 4000)
        surface_temperature = random.uniform(0, 40)
        possible_elements = ["Silicon", "Calcium", "Iron", "Carbon"]
        base_rotation_seconds = random.uniform(0.5, 8) * 3600
        k2_planet = random.uniform(0.3, 0.5)
        Q_planet = random.uniform(200, 500)

    elif planet_type == "Crystalline":
        diameter = random.uniform(0.7, 1.2) * constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3
        density = random.uniform(2000, 4000)
        surface_temperature = random.uniform(-50, 500)
        possible_elements = ["Silicon", "Carbon", "Oxygen", "Iron"]
        base_rotation_seconds = random.uniform(0.5, 12) * 3600
        k2_planet = random.uniform(0.3, 0.6)
        Q_planet = random.uniform(1000, 5000)

    elif planet_type == "Anomaly":
        diameter = random.uniform(0.1, 3) * constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3
        density = random.uniform(500, 10000)
        surface_temperature = random.uniform(-273, 1500)
        possible_elements = ["Copernicium", "Nihonium", "Flerovium", "Moscovium"]
        base_rotation_seconds = random.uniform(0.1, 100) * 3600
        k2_planet = random.uniform(0.1, 0.8)
        Q_planet = random.uniform(1000, 10000000)

    elif planet_type == "Metallic":
        diameter = random.uniform(1, 2.5) * constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3
        density = random.uniform(5000, 8000)
        surface_temperature = random.uniform(-50, 400)
        possible_elements = ["Iron", "Nickel", "Titanium", "Cobalt"]
        base_rotation_seconds = random.uniform(2, 12) * 3600
        k2_planet = random.uniform(0.4, 0.7)
        Q_planet = random.uniform(500, 2000)

    elif planet_type == "Toxic":
        diameter = random.uniform(0.7, 1.5) * constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3
        density = random.uniform(3000, 6000)
        surface_temperature = random.uniform(100, 400)
        possible_elements = ["Sulfur", "Chlorine", "Phosphorus", "Fluorine"]
        base_rotation_seconds = random.uniform(0.5, 10) * 3600
        k2_planet = random.uniform(0.2, 0.5)
        Q_planet = random.uniform(100, 500)

    elif planet_type == "Radioactive":
        diameter = random.uniform(1, 2) * constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3
        density = random.uniform(4000, 7000)
        surface_temperature = random.uniform(-50, 500)
        possible_elements = ["Uranium", "Thorium", "Plutonium", "Radium"]
        base_rotation_seconds = random.uniform(1, 20) * 3600
        k2_planet = random.uniform(0.3, 0.6)
        Q_planet = random.uniform(500, 3000)

    elif planet_type == "Magma":
        diameter = random.uniform(0.8, 1.5) * constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3
        density = random.uniform(4000, 7000)
        surface_temperature = random.uniform(700, 1500)
        possible_elements = ["Magnesium", "Silicon", "Iron", "Sulfur"]
        base_rotation_seconds = random.uniform(3, 15) * 3600
        k2_planet = random.uniform(0.3, 0.5)
        Q_planet = random.uniform(100, 400)

    elif planet_type == "Molten Core":
        diameter = random.uniform(0.8, 1.5) * constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3
        density = random.uniform(5000, 8000)
        surface_temperature = random.uniform(1000, 2000)
        possible_elements = ["Iron", "Nickel", "Magnesium", "Sulfur"]
        base_rotation_seconds = random.uniform(3, 15) * 3600
        k2_planet = random.uniform(0.4, 0.7)
        Q_planet = random.uniform(500, 2000)

    elif planet_type == "Carbon":
        diameter = random.uniform(0.7, 1.5) * constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3
        density = random.uniform(3500, 5000)
        surface_temperature = random.uniform(-50, 300)
        possible_elements = ["Carbon", "Oxygen", "Silicon", "Iron"]
        base_rotation_seconds = random.uniform(1, 8) * 3600
        k2_planet = random.uniform(0.3, 0.5)
        Q_planet = random.uniform(200, 600)

    elif planet_type == "Diamond":
        diameter = random.uniform(0.7, 1.5) * constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3
        density = random.uniform(3000, 7000)
        surface_temperature = random.uniform(-50, 1000)
        possible_elements = ["Carbon", "Silicon", "Nitrogen", "Oxygen"]
        base_rotation_seconds = random.uniform(2, 12) * 3600
        k2_planet = random.uniform(0.4, 0.6)
        Q_planet = random.uniform(500, 2000)

    elif planet_type == "Super Earth":
        diameter = random.uniform(1, 2) * constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3
        density = random.uniform(4000, 6000)
        surface_temperature = random.uniform(-50, 400)
        possible_elements = ["Iron", "Magnesium", "Silicon", "Oxygen"]
        base_rotation_seconds = random.uniform(0.5, 10) * 3600
        k2_planet = random.uniform(0.4, 0.6)
        Q_planet = random.uniform(200, 400)

    elif planet_type == "Sub Earth":
        diameter = random.uniform(0.5, 1) * constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3
        density = random.uniform(3000, 5000)
        surface_temperature = random.uniform(-100, 300)
        possible_elements = ["Silicon", "Iron", "Carbon", "Oxygen"]
        base_rotation_seconds = random.uniform(2, 12) * 3600
        k2_planet = random.uniform(0.35, 0.5)
        Q_planet = random.uniform(150, 300)

    elif planet_type == "Frozen Gas Giant":
        diameter = random.uniform(10, 15) * constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3
        density = random.uniform(500, 1000)
        surface_temperature = random.uniform(-200, -50)
        possible_elements = ["Hydrogen", "Helium", "Neon", "Methane"]
        base_rotation_seconds = random.uniform(3, 6) * 3600
        k2_planet = random.uniform(0.4, 0.6)
        Q_planet = random.uniform(10000, 1000000)

    elif planet_type == "Nebulous":
        diameter = random.uniform(5, 15) * constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3
        density = random.uniform(100, 300)
        surface_temperature = random.uniform(-200, 50)
        possible_elements = ["Hydrogen", "Helium", "Neon", "Argon"]
        base_rotation_seconds = random.uniform(5, 12) * 3600
        k2_planet = random.uniform(0.2, 0.5)
        Q_planet = random.uniform(1000, 5000)

    elif planet_type == "Aquifer":
        diameter = random.uniform(0.8, 1.5) * constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3
        density = random.uniform(2000, 3000)
        surface_temperature = random.uniform(-10, 50)
        possible_elements = ["Oxygen", "Hydrogen", "Sodium", "Chlorine"]
        base_rotation_seconds = random.uniform(1, 6) * 3600
        k2_planet = random.uniform(0.2, 0.4)
        Q_planet = random.uniform(100, 300)

    elif planet_type == "Exotic":
        diameter = random.uniform(0.5, 3) * constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3
        density = random.uniform(1000, 20000)
        surface_temperature = random.uniform(-273, 1500)
        possible_elements = ["Oganesson", "Livermorium", "Tennessine", "Flerovium"]
        base_rotation_seconds = random.uniform(0.3, 30) * 3600
        k2_planet = random.uniform(0.1, 0.8)
        Q_planet = random.uniform(1000, 10000000)

    else:
        diameter = random.uniform(0.5, 2) * constants.D_EARTH
        volume = (4 / 3) * math.pi * (diameter * 1e3 / 2) ** 3
        density = random.uniform(3000, 6000)
        surface_temperature = random.uniform(-100, 500)
        possible_elements = [
            elem for elem, prob in periodic_table if prob > 0.0000000001
        ]
        base_rotation_seconds = random.uniform(5, 50) * 3600
        k2_planet = random.uniform(0.2, 0.7)
        Q_planet = random.uniform(50, 5000)

    if planet_type in ["Gas Giant", "Frozen Gas Giant"]:
        k_factor = 0.4
    elif planet_type in [
        "Rocky",
        "Icy",
        "Oceanic",
        "Desert",
        "Arid",
        "Lava",
        "Tundra",
        "Swamp",
        "Forest",
        "Savannah",
        "Cave",
    ]:
        k_factor = 0.3
    elif planet_type in [
        "Metallic",
        "Radioactive",
        "Magma",
        "Molten Core",
        "Carbon",
        "Diamond",
    ]:
        k_factor = 0.35
    elif planet_type in ["Crystalline", "Anomaly", "Exotic"]:
        k_factor = 0.5
    else:
        k_factor = 0.3

    mass = density * volume

    gravity = constants.G * (mass / (diameter * 1e3 / 2) ** 2)

    orbital_radius = random.uniform(0.1, 40)
    orbital_radius_m = orbital_radius * 1.496e11

    orbital_period_seconds = (
        2 * math.pi * math.sqrt(orbital_radius_m**3 / (constants.G * constants.M_SUN))
    )

    orbital_speed = math.sqrt(constants.G * constants.M_SUN / orbital_radius_m)

    axial_tilt = random.uniform(0, 45)

    moment_of_inertia = k_factor * mass * (diameter * 1e3 / 2) ** 2

    rotation_period_seconds = base_rotation_seconds * math.sqrt(
        moment_of_inertia / (mass * gravity * diameter * 1e3)
    )

    tidal_effect = (
        (3 * constants.G * k2_planet * constants.M_SUN**2 * (diameter * 1e3 / 2) ** 5)
        / (2 * Q_planet * orbital_radius_m**6 * mass)
    ) * orbital_period_seconds

    if orbital_radius > 1:
        tidal_effect *= 0.1

    rotation_period_seconds /= max(1, tidal_effect)

    eccentricity_factor = random.uniform(0.8, 1.2)
    distance_influence = (1 / (orbital_radius**1.5)) * random.uniform(0.9, 1.1)
    rotation_period_seconds *= max(1, eccentricity_factor * distance_influence)

    min_rotation_period_seconds = 6 * 3600
    max_rotation_period_seconds = 365 * 24 * 3600
    rotation_period_seconds = max(
        min_rotation_period_seconds,
        min(rotation_period_seconds, max_rotation_period_seconds),
    )

    # THE DEBUG PROKEZZ
    # print()
    # print()
    # print(f"Planet Name: {name}")
    # print(f"Planet Type: {planet_type}")
    # print(f"Orbital Period Seconds: {orbital_period_seconds}")
    # print(f"Rotation Period Seconds: {rotation_period_seconds}")
    # print(f"Tidal Effect: {tidal_effect}")
    # print(f"Eccentricity Factor: {eccentricity_factor}")
    # print(f"Distance Influence: {distance_influence}")
    # print(f"K2: {k2_planet} - Q: {Q_planet} - Moment Inertia: {moment_of_inertia}")
    # print(f"Gravity: {gravity}")
    # print(f"Mass: {mass}")
    # print(f"Axial Tilt: {axial_tilt}")

    elements = generate_elements_for_planet(planet_seed, possible_elements)

    planet = {
        "Name": name,
        "Type": planet_type,
        "Atmosphere": atmosphere,
        "Mass": mass,
        "Diameter": diameter,
        "Density": density,
        "Gravity": gravity,
        "Orbital Radius": orbital_radius,
        "Orbital Period": orbital_period_seconds,
        "Orbital Speed": orbital_speed,
        "Axial Tilt": axial_tilt,
        "Rotation Period": rotation_period_seconds,
        "Elements": elements,
        "Surface Temperature": surface_temperature,
    }

    planet["Life Forms"] = calculate_life_probability(planet)

    return planet
