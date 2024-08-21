from PIL import Image, ImageDraw, ImageFilter, ImageFont
import math
import random


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
