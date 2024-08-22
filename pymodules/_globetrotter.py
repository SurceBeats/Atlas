# pymodules/_globetrotter.py


def search_life_form_in_simulation(universe, desired_life_form):
    total_galaxies_searched = 0
    total_systems_searched = 0
    total_planets_searched = 0

    print("Searching infinitely for life forms. Please wait...")
    x = 0
    while True:
        for y in range(10000):
            for z in range(10000):
                try:
                    galaxy = universe.get_galaxy(x, y, z)
                    total_galaxies_searched += 1

                    for system_index in range(galaxy.num_systems):
                        solar_system = galaxy.get_solar_system(system_index)
                        total_systems_searched += 1

                        for planet_index in range(solar_system.num_planets):
                            planet = solar_system.get_planet(planet_index)
                            total_planets_searched += 1

                            if planet and planet["Life Forms"] == desired_life_form:
                                print(f"Found {desired_life_form}!")
                                print(f"Galaxy: {galaxy.name} (Coords: {x}, {y}, {z})")
                                print(
                                    f"System #{system_index + 1}: {solar_system.name}"
                                )
                                print(f"Planet: {planet['Name']}")
                                print(f"Details: {planet}")
                                print("-" * 50)

                except ValueError:
                    continue
        x += 1
