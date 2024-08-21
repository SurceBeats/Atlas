import os
import random
from pymodules.naming import generate_name
from pymodules.planet import generate_planet
from pymodules.image_utils import generate_galaxy_image, generate_solar_system_image


class Universe:
    def __init__(self, seed, constants):
        self.seed = seed
        self.constants = constants
        self.galaxies = {}

    def get_galaxy(self, x, y, z):
        # Limitar las coordenadas dentro del rango del universo observable
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
            # Pasar las coordenadas al crear la galaxia
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

        # Definir el número de sistemas estelares según el tipo de galaxia con límites realistas
        if self.galaxy_type == "dwarf":
            self.num_systems = random.randint(
                10**5, 10**7
            )  # Menos sistemas estelares en galaxias enanas
        elif self.galaxy_type == "spiral":
            self.num_systems = random.randint(
                10**9, 5 * 10**10
            )  # Valores más bajos para galaxias espirales
        elif self.galaxy_type == "elliptical":
            self.num_systems = random.randint(
                10**10, 10**11
            )  # Ajuste para galaxias elípticas
        else:
            self.num_systems = random.randint(10**8, 10**9)

        self.solar_systems = {}

        # Generar eventos espaciales
        self.black_holes = random.randint(1, 10)  # Número de agujeros negros
        self.pulsars = random.randint(0, 50)  # Número de púlsares
        self.quasars = random.randint(0, 2)  # Número de quásares (muy raros)

        # Ruta donde se guardará la imagen de la galaxia
        galaxy_image_path = os.path.join("data/galaxy", f"{self.name}.png")

        # Generar la imagen si no existe
        if not os.path.exists(galaxy_image_path):
            image = generate_galaxy_image(self)
            image.save(galaxy_image_path)

    def get_solar_system(self, index):
        if index < 0 or index >= self.num_systems:
            raise ValueError(
                f"Solar System index out of range. Must be between 0 and {self.num_systems - 1}."
            )
        if index not in self.solar_systems:
            system_seed = hash((self.seed, index))
            self.solar_systems[index] = SolarSystem(system_seed, index, self.constants)
        return self.solar_systems[index]

    def summary(self):
        print(f"Galaxy '{self.name}': Type: {self.galaxy_type}")
        print(f" - Number of Solar Systems: {self.num_systems}")
        print(f" - Black Holes: {self.black_holes}")
        print(f" - Pulsars: {self.pulsars}")
        print(f" - Quasars: {self.quasars}")
        for i in range(
            min(self.num_systems, 50)
        ):  # Solo mostrar un resumen de los primeros 50
            system = self.get_solar_system(i)
            print(f"   Solar System #{i - 1}: {system.num_planets} planets")


class SolarSystem:
    def __init__(self, seed, index, constants):
        self.seed = seed
        self.index = index
        self.constants = constants
        random.seed(seed)
        self.name = generate_name(
            seed + index, "system"
        )  # Generar nombre para el sistema solar
        self.num_planets = random.randint(1, 6)
        self.planets = {}

        # Definir el tipo de sistema estelar
        self.star_system_type = self.determine_star_system_type()
        self.stars = self.generate_stars()

        # Generar planetas al inicializar el sistema solar
        for i in range(self.num_planets):
            planet_seed = hash((self.seed, i))
            planet_name = generate_name(planet_seed, "planet")
            self.planets[i] = generate_planet(planet_seed, planet_name, self.constants)

    def determine_star_system_type(self):
        """Determina si el sistema es simple, binario o terciario."""
        system_type = random.choices(
            ["single", "binary", "tertiary"],
            weights=[0.7, 0.25, 0.05],  # Probabilidades ajustables
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

        # Definir tipos de estrellas con sus propiedades
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

    def summary(self):
        print(f"Solar System '{self.name}':")
        print(f" - Star System Type: {self.star_system_type.capitalize()}")
        for i, star in enumerate(self.stars):
            print(
                f"     Star #{i + 1}: Type: {star['Type']}, Color: {star['Color']}, Radius Factor: {star['Radius Factor']}"
            )
        for i in range(self.num_planets):
            planet = self.get_planet(i)
            if planet:
                print(f"     Planet #{i}: '{planet['Name']}':")