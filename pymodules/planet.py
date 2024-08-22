# pymodules\planet.py

import random
import math
from pymodules.elements import periodic_table


def calculate_life_probability(planet):
    score = 0

    # Factores de temperatura
    if -20 <= planet["Surface Temperature"] <= 50:
        score += 20  # Temperatura favorable para vida basada en agua
    elif (
        -100 <= planet["Surface Temperature"] < -20
        or 50 < planet["Surface Temperature"] <= 100
    ):
        score += 10  # Podría soportar formas de vida extremófilas
    else:
        score -= 20  # Temperatura demasiado extrema

    # Composición atmosférica
    if planet["Atmosphere"] in ["Oxygen-Rich", "Nitrogen"]:
        score += 30  # Atmosfera muy favorable
    elif planet["Atmosphere"] in ["Carbon Dioxide", "Methane"]:
        score += 10  # Podría soportar vida, pero no basada en oxígeno
    else:
        score -= 10  # Atmosfera poco favorable

    # Tipo de planeta y presencia de agua
    if planet["Type"] in ["Oceanic", "Swamp", "Aquifer"]:
        score += 30  # Alta probabilidad de vida
    elif planet["Type"] in ["Rocky", "Forest", "Savannah"]:
        score += 20  # Buena probabilidad de vida
    elif planet["Type"] in ["Gas Giant", "Frozen Gas Giant"]:
        score -= 10  # Baja probabilidad de vida, excepto formas exóticas

    # Ajuste por elementos disponibles
    if "Water" in planet["Elements"]:
        score += 20  # Presencia de agua líquida, esencial para la vida
    if "Carbon" in planet["Elements"]:
        score += 10  # Carbono, esencial para formas de vida basadas en carbono
    if "Silicon" in planet["Elements"]:
        score += 5   # Presencia de silicio, esencial para formas de vida basadas en silicio

    # Probabilidad final con tipos de vida raros
    possible_life_forms = ["None"]

    if score >= 60:
        possible_life_forms.extend([
            "Intelligent Life",
            "Animal Life",
            "Vegetation",
            "Bacteria",
            "Vegetable Animals"  # 0.05% probabilidad
        ])
        if random.random() < 0.0005:  # 0.05% chance
            return "Vegetable Animals"
    elif 40 <= score < 60:
        possible_life_forms.extend(["Animal Life", "Vegetation", "Bacteria"])
    elif 20 <= score < 40:
        possible_life_forms.extend(["Bacteria", "Vegetation"])

    # Tipos de vida exóticos y raros
    if "Silicon" in planet["Elements"]:
        if random.random() < 0.02:  # 2% chance
            return "Silicon-Based Life"
    if random.random() < 0.0001:  # 0.01% chance
        return "Non-Physical Entity"
    if planet["Atmosphere"] in ["Methane", "Ammonia"]:
        if random.random() < 0.00001:  # 0.001% chance
            return "Conscious Gas"
    if planet["Type"] in ["Metallic", "Crystalline"]:
        if random.random() < 0.001:  # 0.1% chance
            return "Robotic Entities"

    return random.choice(possible_life_forms)

def generate_planet(seed, name, constants):
    random.seed(seed)

    # Tipo de planeta
    planet_type = random.choice([
        "Rocky", "Gas Giant", "Icy", "Oceanic", "Desert", "Lava", "Arid", 
        "Tundra", "Swamp", "Forest", "Savannah", "Cave", "Crystalline", 
        "Metallic", "Toxic", "Radioactive", "Magma", "Molten Core", 
        "Carbon", "Diamond", "Super Earth", "Sub Earth", "Frozen Gas Giant", 
        "Nebulous", "Aquifer", "Exotic"
    ])

    # Asignar tipos de atmósfera adecuados al tipo de planeta
    if planet_type in ["Gas Giant", "Frozen Gas Giant", "Nebulous"]:
        possible_atmospheres = [
            "Hydrogen", "Helium", "Methane", "Ammonia", "Carbon Dioxide", 
            "Toxic", "Ionic", "Plasma", "Exotic Gases", "Water Vapor",
        ]
    elif planet_type in ["Rocky", "Oceanic", "Desert", "Lava", "Arid", "Tundra", "Swamp"]:
        possible_atmospheres = [
            "Thick", "Thin", "None", "Breathable", "Carbon Dioxide", 
            "Methane", "Nitrogen", "Oxygen-Rich", "Sulfur Dioxide", 
            "Superheated", "Acidic",
        ]
    else:
        possible_atmospheres = [
            "Exotic Gases", "Plasma", "Ionic", "None", "Frozen", 
            "Acidic", "Toxic", "Superheated", "Hydrogen", "Helium",
        ]

    atmosphere = random.choice(possible_atmospheres)

    # Características físicas y temperatura superficial ajustadas
    if planet_type == "Gas Giant":
        mass = random.uniform(100, 300) * constants.M_EARTH
        diameter = random.uniform(10, 15) * constants.D_EARTH
        density = mass / ((4 / 3) * math.pi * (diameter / 2) ** 3) * 0.5
        surface_temperature = random.uniform(-150, 100)  # Temperatura adecuada para un gigante gaseoso
        possible_elements = ["Hydrogen", "Helium", "Methane", "Ammonia"]

    elif planet_type == "Icy":
        mass = random.uniform(0.5, 5) * constants.M_EARTH
        diameter = random.uniform(0.5, 2) * constants.D_EARTH
        density = mass / ((4 / 3) * math.pi * (diameter / 2) ** 3)
        surface_temperature = random.uniform(-200, 0)  # Muy frío
        possible_elements = ["Water", "Ammonia", "Methane", "Nitrogen"]

    elif planet_type == "Lava":
        mass = random.uniform(0.5, 5) * constants.M_EARTH
        diameter = random.uniform(0.7, 2.5) * constants.D_EARTH
        density = mass / ((4 / 3) * math.pi * (diameter / 2) ** 3)
        surface_temperature = random.uniform(500, 1200)  # Extremadamente caliente
        possible_elements = ["Magnesium", "Silicon", "Iron"]

    elif planet_type == "Oceanic":
        mass = random.uniform(0.5, 5) * constants.M_EARTH
        diameter = random.uniform(0.8, 2) * constants.D_EARTH
        density = mass / ((4 / 3) * math.pi * (diameter / 2) ** 3) * 1.1
        surface_temperature = random.uniform(-10, 50)  # Similar a la Tierra, pero puede ser más frío
        possible_elements = ["Water", "Oxygen", "Carbon Dioxide"]

    elif planet_type == "Desert":
        mass = random.uniform(0.3, 5) * constants.M_EARTH
        diameter = random.uniform(0.7, 2) * constants.D_EARTH
        density = mass / ((4 / 3) * math.pi * (diameter / 2) ** 3)
        surface_temperature = random.uniform(50, 200)  # Caliente y seco
        possible_elements = ["Silicon", "Oxygen", "Iron"]

    elif planet_type == "Swamp":
        mass = random.uniform(0.5, 5) * constants.M_EARTH
        diameter = random.uniform(0.8, 2) * constants.D_EARTH
        density = mass / ((4 / 3) * math.pi * (diameter / 2) ** 3)
        surface_temperature = random.uniform(10, 50)  # Clima húmedo y cálido
        possible_elements = ["Water", "Carbon", "Oxygen", "Phosphorus"]

    else:
        mass = random.uniform(0.1, 10) * constants.M_EARTH
        diameter = random.uniform(0.5, 2) * constants.D_EARTH
        density = mass / ((4 / 3) * math.pi * (diameter / 2) ** 3)
        surface_temperature = random.uniform(-100, 500)  # Temperaturas genéricas
        possible_elements = [elem for elem, prob in periodic_table if prob > 0.00001]

    gravity = constants.G * (mass / (diameter / 2) ** 2)

    orbital_radius = random.uniform(0.1, 40)  # Distancia promedio al sol en AU

    # Período orbital calculado usando la tercera ley de Kepler
    star_mass = constants.M_SUN  # Masa de la estrella similar al Sol
    orbital_period_seconds = (
        2 * math.pi * math.sqrt((orbital_radius * 1.496e11) ** 3 / (constants.G * star_mass))
    )
    orbital_period_years = orbital_period_seconds / (60 * 60 * 24 * 365.25)

    orbital_speed = (constants.G * star_mass / (orbital_radius * 1.496e11)) ** 0.5

    axial_tilt = random.uniform(0, 90)  # Inclinación axial en grados

    # Efectos de marea y ajuste por inercia
    tidal_effect = (constants.G * star_mass / (orbital_radius * 1.496e11) ** 2) ** 0.5
    inertia_effect = (mass / constants.M_EARTH) ** 0.25

    rotation_period = random.uniform(10, 1000) * inertia_effect / tidal_effect
    rotation_period = max(0.1, rotation_period)

    # Generar elementos para un planeta
    def generate_elements_for_planet():
        elements, weights = zip(*periodic_table)

        # Posibilidad de anomalía planetaria
        if random.random() < 0.01:  # 1% de probabilidad de anomalía
            dominant_element = random.choices(elements, weights=weights, k=1)[0]
            return [dominant_element] * random.randint(5, 10)

        selected_elements = random.sample(
            possible_elements, k=min(len(possible_elements), random.randint(2, 10))
        )

        return selected_elements

    elements = generate_elements_for_planet()

    # Generar planeta con todas sus características
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

    # Calcular la probabilidad de vida después de haber generado todas las características del planeta
    planet["Life Forms"] = calculate_life_probability(planet)

    return planet
