# pymodules/__atlas_observer.py

import gc

from pymodules.__atlas_stargate import generate_planet_url


planet_types = [
    "None",
    "Gas Giant",
    "Rocky",
    "Icy",
    "Anomaly",
    "Oceanic",
    "Desert",
    "Lava",
    "Arid",
    "Swamp",
    "Tundra",
    "Forest",
    "Savannah",
    "Cave",
    "Crystalline",
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
    "Super Puff",
    "Super Ringed",
    "Mirror",
    "Ruby Cloud",
]

life_forms = [
    "None",
    "Intelligent Life",
    "Animal Life",
    "Vegetation",
    "Bacteria",
    "Vegetable Animals",
    "Silicon-Based Life",
    "Non-Physical Entity",
    "Conscious Gas",
    "Robotic Entities",
    "Have I just found God?",
]


def select_option(options, prompt="Please select an option"):
    print(prompt)
    for i, option in enumerate(options, 1):
        print(f"{i}. {option}")

    while True:
        try:
            selection = int(input("Enter the number of your choice: "))
            if 1 <= selection <= len(options):
                return options[selection - 1]
            else:
                print("Invalid selection. Please choose a valid number.")
        except ValueError:
            print("Invalid input. Please enter a number.")


def observer(universe):
    desired_planet_type = select_option(planet_types, "Please select a planet type:")
    desired_life_form = select_option(life_forms, "Please select a desired life form:")

    has_rings_option = select_option(
        ["Yes", "No", "Doesn't matter", "Infinite Search (Rings)"],
        "Do you want the planet to have rings? (Select 'Doesn't matter' to skip or 'Infinite Search' for endless rings search)",
    )

    has_moons_option = select_option(
        ["Yes", "No", "Doesn't matter"],
        "Do you want the planet to have moons?",
    )

    if desired_planet_type == "None":
        desired_planet_type = None
    if desired_life_form == "None":
        desired_life_form = None

    search_rings = None
    if has_rings_option == "Yes":
        search_rings = True
    elif has_rings_option == "No":
        search_rings = False
    elif has_rings_option == "Infinite Search (Rings)":
        search_rings = "infinite"

    search_moons = None
    if has_moons_option == "Yes":
        search_moons = True
    elif has_moons_option == "No":
        search_moons = False

    if not desired_planet_type and not desired_life_form and search_rings is None and search_moons is None:
        print(
            "You must select at least one criterion (planet type, life form, rings, or moons) to search."
        )
        return

    total_galaxies_searched = 0
    total_systems_searched = 0
    total_planets_searched = 0
    planets_with_rings = 0

    planet_type_counts = {ptype: 0 for ptype in planet_types}
    planets_with_rings_by_type = {ptype: 0 for ptype in planet_types}

    x = 0
    while True:
        for y in range(9999999):
            for z in range(9999999):
                try:
                    galaxy = universe.get_galaxy(x, y, z)
                    total_galaxies_searched += 1

                    for system_index in range(galaxy.num_systems):
                        solar_system = galaxy.get_solar_system(system_index)
                        total_systems_searched += 1

                        for planet_index in range(solar_system.num_planets):
                            planet = solar_system.get_planet(planet_index)
                            total_planets_searched += 1

                            if planet:
                                planet_type = planet.planet_type
                                planet_type_counts[planet_type] += 1

                                if search_rings == "infinite":
                                    if planet.planet_rings:
                                        planets_with_rings += 1
                                        planets_with_rings_by_type[planet_type] += 1

                                match = True
                                if planet and search_rings != "infinite":
                                    if (
                                        desired_planet_type
                                        and planet.planet_type != desired_planet_type
                                    ):
                                        match = False

                                    if (
                                        desired_life_form
                                        and planet.life_forms != desired_life_form
                                    ):
                                        match = False

                                    if (
                                        search_rings is not None
                                        and planet.planet_rings != search_rings
                                    ):
                                        match = False

                                    if search_moons is not None:
                                        has_moons = hasattr(planet, 'moon_system') and planet.moon_system and len(planet.moon_system.moons) > 0
                                        if has_moons != search_moons:
                                            match = False

                                    if match:
                                        print("Found a match!")
                                        print(
                                            f"Galaxy: {galaxy.name} (Coords: {x}, {y}, {z})"
                                        )
                                        print(
                                            f"System #{system_index + 1}: {solar_system.name}"
                                        )
                                        print(f"Planet: {planet.name}")
                                        print(
                                            f"URL: http://localhost{generate_planet_url((x, y, z), system_index, planet.name, (system_index - 1) // 50 + 1)}"
                                        )
                                        print(
                                            f" + Galaxies Mapped: #{total_galaxies_searched} (now {x}, {y}, {z}), Systems Mapped: #{total_systems_searched}, Planets Mapped: #{total_planets_searched}"
                                        )
                                        print("-" * 50)
                                        print("")
                                        input("Press Enter to continue searching...")

                            del planet
                            gc.collect()

                        del solar_system
                        gc.collect()

                    del galaxy
                    gc.collect()

                except ValueError:
                    continue

        x += 1
