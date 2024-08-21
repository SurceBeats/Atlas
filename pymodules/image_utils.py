from PIL import Image, ImageDraw, ImageFilter, ImageFont
import math
import random

from PIL import Image, ImageDraw, ImageFont, ImageOps

def generate_planet_image(planet):
    img_size = 800  # Tamaño de la imagen
    image = Image.new("RGB", (img_size, img_size), "black")
    planet_surface = Image.new("RGBA", (img_size, img_size), (0, 0, 0, 0))  # Crear una imagen con transparencia para la superficie
    draw = ImageDraw.Draw(planet_surface)

    try:
        font = ImageFont.truetype("arial.ttf", 14)
    except IOError:
        font = ImageFont.load_default()

    center_x = img_size // 2
    center_y = img_size // 2

    # Usar el seed para asegurar consistencia en la generación
    random.seed(hash(planet["Name"]))

    # Ajustar el tamaño del planeta en función de su masa y diámetro
    planet_radius = int(150 * (planet["Diameter"] / max(planet["Diameter"], 1)))

    # Determinar el color de la superficie según la temperatura
    surface_temp = planet["Surface Temperature"]
    if surface_temp > 1000:
        surface_color = "red"
    elif surface_temp > 500:
        surface_color = "orange"
    elif surface_temp > 0:
        surface_color = "yellow"
    elif surface_temp > -50:
        surface_color = "blue"
    else:
        surface_color = "lightblue"

    # Dibujar la superficie básica del planeta
    draw.ellipse(
        (
            center_x - planet_radius,
            center_y - planet_radius,
            center_x + planet_radius,
            center_y + planet_radius,
        ),
        fill=surface_color,
    )

    # Añadir detalles basados en el tipo de planeta
    if planet["Type"] in ["Oceanic", "Swamp", "Aquifer"]:
        water_color = "blue"
        land_color = "green" if planet["Type"] == "Swamp" else "brown"
        num_water_bodies = random.randint(3, 7)
        for _ in range(num_water_bodies):
            body_radius = random.randint(10, int(planet_radius * 0.5))
            # Permitir que el cuerpo de agua/lava sobresalga
            body_x = center_x + random.randint(-planet_radius, planet_radius)
            body_y = center_y + random.randint(-planet_radius, planet_radius)
            draw.ellipse(
                (body_x - body_radius, body_y - body_radius, body_x + body_radius, body_y + body_radius),
                fill=water_color,
            )
            if random.random() < 0.5:  # 50% de probabilidad de añadir tierra cerca del agua
                draw.ellipse(
                    (body_x - body_radius - 10, body_y - body_radius - 10, body_x + body_radius + 10, body_y + body_radius + 10),
                    outline=land_color, width=3,
                )

    elif planet["Type"] in ["Gas Giant", "Frozen Gas Giant", "Nebulous"]:
        num_cloud_bands = random.randint(3, 6)
        for i in range(num_cloud_bands):
            band_width = planet_radius // 10
            band_offset = (i - num_cloud_bands // 2) * band_width * 2
            band_color = "orange" if planet["Type"] == "Gas Giant" else "lightblue"
            draw.ellipse(
                (
                    center_x - planet_radius,
                    center_y - band_width + band_offset,
                    center_x + planet_radius,
                    center_y + band_width + band_offset,
                ),
                fill=band_color,
            )

    elif planet["Type"] == "Lava":
        num_lava_flows = random.randint(5, 10)
        for _ in range(num_lava_flows):
            flow_radius = random.randint(5, int(planet_radius * 0.3))
            # Permitir que el flujo de lava sobresalga
            flow_x = center_x + random.randint(-planet_radius, planet_radius)
            flow_y = center_y + random.randint(-planet_radius, planet_radius)
            draw.ellipse(
                (flow_x - flow_radius, flow_y - flow_radius, flow_x + flow_radius, flow_y + flow_radius),
                fill="red",
            )

    # Crear una máscara circular para recortar lo que sobresalga del planeta
    mask = Image.new("L", (img_size, img_size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse(
        (
            center_x - planet_radius,
            center_y - planet_radius,
            center_x + planet_radius,
            center_y + planet_radius,
        ),
        fill=255
    )

    # Aplicar la máscara a la superficie del planeta
    planet_surface = Image.composite(planet_surface, Image.new("RGBA", planet_surface.size, (0, 0, 0, 0)), mask)

    # Añadir atmósfera si tiene
    if planet["Atmosphere"] != "None":
        atmosphere_color = "lightgreen" if "Breathable" in planet["Atmosphere"] else "gray"
        draw = ImageDraw.Draw(planet_surface)
        draw.ellipse(
            (
                center_x - planet_radius - 10,
                center_y - planet_radius - 10,
                center_x + planet_radius + 10,
                center_y + planet_radius + 10,
            ),
            outline=atmosphere_color,
            width=2,
        )

    # Añadir inclinación axial
    draw.line(
        (
            center_x - planet_radius * math.sin(math.radians(planet["Axial Tilt"])),
            center_y - planet_radius * math.cos(math.radians(planet["Axial Tilt"])),
            center_x + planet_radius * math.sin(math.radians(planet["Axial Tilt"])),
            center_y + planet_radius * math.cos(math.radians(planet["Axial Tilt"])),
        ),
        fill="white",
        width=2,
    )

    # Añadir satélites si tiene vida inteligente
    if planet["Life Forms"] == "Intelligent":
        num_satellites = random.randint(1, 5)
        for _ in range(num_satellites):
            satellite_distance = planet_radius + random.randint(20, 40)
            satellite_angle = random.uniform(0, 2 * math.pi)
            satellite_x = center_x + int(satellite_distance * math.cos(satellite_angle))
            satellite_y = center_y + int(satellite_distance * math.sin(satellite_angle))
            draw.ellipse(
                (satellite_x - 3, satellite_y - 3, satellite_x + 3, satellite_y + 3),
                fill="white",
            )

    # Combinar la superficie del planeta con la imagen final
    image.paste(planet_surface, (0, 0), planet_surface)

    # Escribir el nombre del planeta, ajustar el texto más abajo
    text_x = center_x
    text_y = center_y + planet_radius + 40  # Ajuste de 40 píxeles en lugar de 20 para mayor separación
    draw = ImageDraw.Draw(image)
    draw.text((text_x, text_y), planet["Name"], font=font, fill="white", anchor="mm")

    return image



def generate_solar_system_image(solar_system):
    img_size = 800  # Tamaño de la imagen para acomodar órbitas más grandes
    image = Image.new("RGB", (img_size, img_size), "black")
    draw = ImageDraw.Draw(image)

    try:
        font = ImageFont.truetype("arial.ttf", 12)
    except IOError:
        font = ImageFont.load_default()

    center_x = img_size // 2
    center_y = img_size // 2

    # Configuración para estrellas
    star_positions = []
    separation = 50  # Mayor separación entre estrellas en binarios/terciarios
    if solar_system.star_system_type == "single":
        star_positions.append((center_x, center_y))
    elif solar_system.star_system_type == "binary":
        star_positions.append((center_x - separation, center_y))
        star_positions.append((center_x + separation, center_y))
    elif solar_system.star_system_type == "tertiary":
        star_positions.append((center_x - separation, center_y))
        star_positions.append((center_x + separation, center_y))
        star_positions.append((center_x, center_y - separation))

    # Dibujar las estrellas con un tamaño máximo limitado
    max_star_radius = 50  # Tamaño máximo de la estrella
    for i, star in enumerate(solar_system.stars):
        star_x, star_y = star_positions[i]
        star_radius = min(int(15 * star["Radius Factor"]), max_star_radius)
        draw.ellipse(
            (
                star_x - star_radius,
                star_y - star_radius,
                star_x + star_radius,
                star_y + star_radius,
            ),
            fill=star["Color"],
        )

    num_planets = solar_system.num_planets
    min_orbit_radius = star_radius * 2 + 50  # Separación inicial desde la estrella
    max_orbit_radius = img_size // 2 - 50  # Tamaño máximo de la órbita

    for i in range(1, num_planets + 1):
        planet = solar_system.get_planet(i - 1)
        if planet:
            # Determinar el radio orbital usando la constante física
            relative_orbit_radius = planet["Orbital Radius"] / max(
                [p["Orbital Radius"] for p in solar_system.planets.values()]
            )
            orbit_radius = min_orbit_radius + int(
                relative_orbit_radius * (max_orbit_radius - min_orbit_radius)
            )

            # Ajustar la excentricidad de la órbita (debe ser menor para planetas interiores)
            eccentricity = random.uniform(0.0, 0.3) * (1 - relative_orbit_radius)

            # Calcular los semiejes mayor y menor de la órbita
            semi_major_axis = orbit_radius
            semi_minor_axis = semi_major_axis * math.sqrt(1 - eccentricity**2)

            # Dibujar la órbita como una elipse
            draw.ellipse(
                (
                    center_x - semi_major_axis,
                    center_y - semi_minor_axis,
                    center_x + semi_major_axis,
                    center_y + semi_minor_axis,
                ),
                outline="white",
                width=1,
            )

            # Determinar la posición del planeta en la órbita usando la velocidad orbital
            angle = random.uniform(0, 2 * math.pi)
            planet_x = center_x + semi_major_axis * math.cos(angle)
            planet_y = center_y + semi_minor_axis * math.sin(angle)

            # Determinar el color del planeta según su tipo
            planet_color = {
                "Gas Giant": "orange",
                "Rocky": "gray",
                "Oceanic": "blue",
                "Lava": "red",
                "Icy": "lightblue",
                "Desert": "yellow",
                "Arid": "brown",
                "Swamp": "green",
                "Crystalline": "cyan",
                "Metallic": "silver",
                "Toxic": "purple",
                "Radioactive": "lime",
                "Super Earth": "lightgreen",
                "Sub Earth": "darkgreen",
                "Frozen Gas Giant": "lightblue",
                "Nebulous": "pink",
                "Aquifer": "aqua",
                "Exotic": "magenta",
            }.get(planet["Type"], "white")

            # Ajustar el tamaño del planeta según su diámetro y características
            max_diameter = max([p["Diameter"] for p in solar_system.planets.values()])
            planet_radius = int(5 * (planet["Diameter"] / max_diameter))

            draw.ellipse(
                (
                    planet_x - planet_radius,
                    planet_y - planet_radius,
                    planet_x + planet_radius,
                    planet_y + planet_radius,
                ),
                fill=planet_color,
            )

            text_x = planet_x + planet_radius + 5
            text_y = planet_y - planet_radius / 2
            draw.text((text_x, text_y), planet["Name"], font=font, fill="white")

    return image


def generate_galaxy_image(galaxy):
    img_size = 800
    image = Image.new("RGB", (img_size, img_size), "black")
    draw = ImageDraw.Draw(image)

    center_x = img_size // 2
    center_y = img_size // 2

    if galaxy.galaxy_type == "spiral":
        num_arms = 4
        arm_offset = 2 * math.pi / num_arms
        max_radius = img_size // 2
        spread = 0.15
        arm_tightness = 0.5
        core_density = 0.1

        num_points = 50000

        # Crear una máscara para aplicar desenfoque en las áreas externas
        mask = Image.new("L", (img_size, img_size), 0)
        mask_draw = ImageDraw.Draw(mask)

        # Dibujar el núcleo con alta densidad
        for i in range(int(num_points * core_density)):
            angle = random.uniform(0, 2 * math.pi)
            radius = random.gauss(max_radius * 0.1, max_radius * 0.05)
            x = center_x + radius * math.cos(angle)
            y = center_y + radius * math.sin(angle)
            draw.point((x, y), fill="white")

        # Dibujar los brazos espirales
        for i in range(num_points):
            theta = arm_tightness * math.sqrt(i / num_points) * 2 * math.pi
            arm_angle = i % num_arms * arm_offset

            radius = max_radius * math.sqrt(i / num_points)
            x = (
                center_x
                + radius * math.cos(theta + arm_angle)
                + random.uniform(-spread * radius, spread * radius)
            )
            y = (
                center_y
                + radius * math.sin(theta + arm_angle)
                + random.uniform(-spread * radius, spread * radius)
            )

            # Dibujar la estrella
            draw.point((x, y), fill="white")

            # Agregar desenfoque progresivo a las partes externas
            if (
                radius > max_radius * 0.6
            ):  # Aplicar desenfoque solo en las áreas externas
                mask_draw.point((x, y), fill="white")

        # Aplicar desenfoque ligero a las partes externas usando la máscara
        blurred_image = image.filter(ImageFilter.GaussianBlur(radius=5))
        image.paste(blurred_image, (0, 0), mask)

    if galaxy.galaxy_type == "elliptical":
        num_points = 100000  # Representar con 1000 sistemas máximo
        for _ in range(num_points):
            angle = random.uniform(0, 2 * math.pi)
            radius = random.gauss(img_size // 4, img_size // 8)
            x = center_x + radius * math.cos(angle)
            y = center_y + radius * math.sin(angle)

            draw.point((x, y), fill="white")

        # Crear una máscara para aplicar desenfoque solo en las partes externas
        mask = Image.new("L", (img_size, img_size), 0)
        mask_draw = ImageDraw.Draw(mask)
        outer_radius = img_size // 2
        inner_radius = img_size // 3

        # Dibujar un gradiente radial en la máscara
        for r in range(inner_radius, outer_radius):
            alpha = int(255 * (r - inner_radius) / (outer_radius - inner_radius))
            mask_draw.ellipse(
                (center_x - r, center_y - r, center_x + r, center_y + r),
                outline=alpha,
                width=2,
            )

        # Aplicar desenfoque solo a las áreas externas usando la máscara
        blurred_image = image.filter(ImageFilter.GaussianBlur(radius=10))
        image.paste(blurred_image, (0, 0), mask)

    elif galaxy.galaxy_type == "dwarf":
        # Ajuste para galaxias enanas
        max_radius = img_size // 3  # Tamaño más pequeño, dispersión moderada
        spread = 0.3

        for i in range(
            galaxy.num_systems // 100
        ):  # Representar con 100 veces menos densidad
            angle = random.uniform(0, 2 * math.pi)
            radius = random.gauss(max_radius / 2, spread * max_radius)
            x = center_x + radius * math.cos(angle)
            y = center_y + radius * math.sin(angle)

            draw.ellipse((x, y, x + 1, y + 1), fill="white")

    # Dibujar agujeros negros, púlsares y quásares como antes
    for _ in range(galaxy.black_holes):
        x = random.randint(center_x - 20, center_x + 20)
        y = random.randint(center_y - 20, center_y + 20)
        draw.ellipse((x, y, x + 3, y + 3), fill="blue")

    for _ in range(galaxy.pulsars):
        x = random.randint(0, img_size)
        y = random.randint(0, img_size)
        draw.ellipse((x, y, x + 5, y + 5), fill="yellow")

    for _ in range(galaxy.quasars):
        x = random.randint(0, img_size)
        y = random.randint(0, img_size)
        draw.ellipse((x, y, x + 10, y + 10), fill="red")

    return image
