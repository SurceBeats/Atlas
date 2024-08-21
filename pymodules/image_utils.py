from PIL import Image, ImageDraw, ImageFilter, ImageFont
import math
import random

def generate_planet_image(planet):
    img_size = 800  # Tamaño de la imagen
    image = Image.new("RGB", (img_size, img_size), "black")
    draw = ImageDraw.Draw(image)

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
            # Asegurarse de que el cuerpo de agua/lava esté completamente dentro del planeta
            max_offset = planet_radius - body_radius
            body_x = center_x + random.randint(-max_offset, max_offset)
            body_y = center_y + random.randint(-max_offset, max_offset)
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
            # Asegurarse de que el flujo de lava esté completamente dentro del planeta
            max_offset = planet_radius - flow_radius
            flow_x = center_x + random.randint(-max_offset, max_offset)
            flow_y = center_y + random.randint(-max_offset, max_offset)
            draw.ellipse(
                (flow_x - flow_radius, flow_y - flow_radius, flow_x + flow_radius, flow_y + flow_radius),
                fill="red",
            )

    # Añadir atmósfera si tiene
    if planet["Atmosphere"] != "None":
        atmosphere_color = "lightgreen" if "Breathable" in planet["Atmosphere"] else "gray"
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
    tilt_angle = planet["Axial Tilt"]
    draw.line(
        (
            center_x - planet_radius * math.sin(math.radians(tilt_angle)),
            center_y - planet_radius * math.cos(math.radians(tilt_angle)),
            center_x + planet_radius * math.sin(math.radians(tilt_angle)),
            center_y + planet_radius * math.cos(math.radians(tilt_angle)),
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

    # Escribir el nombre del planeta, ajustar el texto más abajo
    text_x = center_x
    text_y = center_y + planet_radius + 40  # Ajuste de 40 píxeles en lugar de 20 para mayor separación
    draw.text((text_x, text_y), planet["Name"], font=font, fill="white", anchor="mm")

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
